import got from 'got'
import { parse as parseQuery, stringify as stringifyQuery } from 'querystring'
import { parse as parseUrl } from 'url'

const { ACCOUNT_SID, AUTH_TOKEN } = process.env
const { root } = program.refs

const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}`
const baseUrlv1 = `https://messaging.twilio.com/v1`
const headers = { accept: 'application/json', 'content-type': 'application/json' }
const auth = `${ACCOUNT_SID}:${AUTH_TOKEN}`;

async function api(method, url, options) {
  const result = await got[method](url, { auth, ...options });
  return JSON.parse(result.body)
}

const apiGet = (path) => api('get', baseUrl + path, { headers });
const apiPost = (path, body) => api('post', baseUrl + path, { body, form: true });
const apiGetv1 = (path) => api('get', baseUrlv1 + path, { headers });
const apiPostv1 = (path, body) => api('post', baseUrlv1 + path, { body, form: true });

export async function init() {
  await root.set({
    messages: {},
    messagingServices: {},
  })
}
export async function update() { return init(); }

export async function test({ name }) {
  switch (name) {
    case 'access': {
      try {
        const testUrl = `${baseUrl}/Accounts/${ACCOUNT_SID}/Messages.json`;
        const res = await got.get(testUrl, { headers, auth })
        return res && res.statusCode === 200;
      } catch (e) {
        return false;
      }
      break;
    }
    case 'webhooks': {
      // TODO
      return false;
    }
  }
  return false;
}

export function endpoint({ name, req }) {
  switch (name) {
    case 'webhooks': {
      const sms = {
        from: req.body.From,
        to: req.body.To,
        body: req.body.Body,
      }
      console.log('Received:',req.body);
      break;
    }
  }
}

export const MessageCollection = {
  async one({ args }) {
    return apiGet(`/Messages/${args.sid}.json`);
  },
  async sendSms({ args }) {
    return apiPost(`/Messages.json`, {
      From: args.from,
      To: args.to,
      Body: args.body,
    });
  },
  async page({ args }) {
    const pageSize = args.pageSize || 50
    const query = stringifyQuery({
      PageSize: args.pageSize || 50, // max is 1000
      Page: args.page,
      PageToken: args.pageToken,
    })
    return apiGet(`/Messages.json?${query}`);
  },
}

export let MessagePage = {
  next({ self, source }) {
    if (source.next_page_uri === undefined) {
      return null
    }
    const { PageToken, Page, PageSize } = parseQuery(
      parseUrl(source.next_page_uri).query
    )
    return root.messages.page({
      pageSize: PageSize,
      pageToken: PageToken,
      page: Page,
    })
  },
  items({ source }) {
    return source.messages
  },
}

export const Message = {
  async self({ source }) {
    return root.messages.one({ sid: source.sid })
  },
  accountSid({ source }) {
    return source['account_id']
  },
  apiVersion({ source }) {
    return source['api_version']
  },
  numSegments({ source }) {
    return source['num_segments']
  },
  numMedia({ source }) {
    return source['num_media']
  },
  dateCreated({ source }) {
    return source['date_created']
  },
  dateSent({ source }) {
    return source['date_sent']
  },
  dateUpdated({ source }) {
    return source['date_updated']
  },
  errorCode({ source }) {
    return source['error_code']
  },
  errorMessage({ source }) {
    return source['error_message']
  },
}

export const MessagingServiceCollection = {
  async one({ args }) {
    const result = await apiGetv1(`/Services/${args.sid}`);
    return result;
  },
  async sendSms({ self, args }) {
    const { sid } = self.match(root.messagingService.one);
    return apiPost(`/Messages.json`, {
      MessagingServiceSid: sid,
      To: args.to,
      Body: args.body,
    });
  },
  async items({ args }) {
    const result = await apiGetv1(`/Services`);
    return result.services;
  },
}
export const MessagingService = {
  self({ source }) {
    return root.messagingServices.one({ sid: source.sid });
  },
  friendlyName({ source }) { return source.friendly_name; }
}
