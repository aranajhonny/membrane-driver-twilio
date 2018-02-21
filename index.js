import got from 'got';

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
  async sendSMS({ self, args }) {
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

  // TODO: Paging
  // https://www.twilio.com/docs/api/rest/response#response-formats-list-paging-information
  async items() {
    const result = await got.get(
      `${baseUrl}/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        },
        auth: `${ACCOUNT_SID}:${AUTH_TOKEN}`
      }
    );
    const json = JSON.parse(result.body);
    return json.messages;
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
