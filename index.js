import got from 'got';
import { parse } from 'querystring';
import { resolve } from 'url';

const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
const { root } = program.refs;

const baseUrl = 'https://api.twilio.com/2010-04-01';
export async function init() {
  await root.set({
    messages: {}
  });
}

export const MessagesCollection = {
  async one({ args }) {
    const { sid } = args;
    const result = await got.get(
      `${baseUrl}/Accounts/${ACCOUNT_SID}/Messages/${sid}.json`,
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        },
        auth: `${ACCOUNT_SID}:${AUTH_TOKEN}`
      }
    );
    const json = JSON.parse(result.body);
    return json;
  },
  async sendSms({ self, args }) {
    result = await got.post(
      `${baseUrl}/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        body: {
          From: args.from,
          To: args.to,
          Body: args.body
        },
        form: true,
        auth: `${ACCOUNT_SID}:${AUTH_TOKEN}`
      }
    );
    return result.status;
  },
  async page({ args }) {
    // The default is 50, and the maximum is 1000.
    const pageSize = args.pageSize || 50;

    let url = args.nextPageUri
      ? resolve(baseUrl, args.nextPageUri)
      : `${baseUrl}/Accounts/${ACCOUNT_SID}/Messages.json?PageSize=${pageSize}`;

    const result = await got.get(url, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      auth: `${ACCOUNT_SID}:${AUTH_TOKEN}`
    });
    const json = JSON.parse(result.body);
    console.log(json.next_page_uri);
    return json;
  }
};

export let MessagePage = {
  next({ self, source }) {
    if (source.next_page_uri === undefined) {
      return null;
    }
    return root.messages.page({ nextPageUri: source.next_page_uri });
  },
  items({ source }) {
    return source.messages;
  }
};

export const Message = {
  async self({ source }) {
    return root.messages.one({ sid: source.sid });
  },
  accountSid({ source }) {
    return source['account_id'];
  },
  apiVersion({ source }) {
    return source['api_version'];
  },
  numSegments({ source }) {
    return source['num_segments'];
  },
  numMedia({ source }) {
    return source['num_media'];
  },
  dateCreated({ source }) {
    return source['date_created'];
  },
  dateSent({ source }) {
    return source['date_sent'];
  },
  dateUpdated({ source }) {
    return source['date_updated'];
  },
  errorCode({ source }) {
    return source['error_code'];
  },
  errorMessage({ source }) {
    return source['error_message'];
  }
};
