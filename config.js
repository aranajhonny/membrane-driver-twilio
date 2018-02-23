const { schema, imports, dependencies, environment, expressions, endpoints } = program;

environment
  .add('ACCOUNT_SID', 'The Account SID')
  .add('AUTH_TOKEN', 'The Auth Token')

schema.type('Root')
  .field('messages', 'MessagesCollection')

schema.type('MessagesCollection')
  .computed('one', 'Message')
    .param('sid', 'String')
  .computed('page', 'MessagePage')
    .param('pageSize', 'Int')
  .action('sendSms')
    .param('from', 'String')
    .param('to', 'String')
    .param('body', 'String')

schema.type('MessagePage')
  .computed('items', '[Message]')
  .computed('next', 'MessagePage*')

schema.type('Message')
  .computed('self', 'Message*')
  .field('direction', 'String')
  .field('body', 'String')
  .field('from', 'String')
  .field('price', 'String')
  .field('sid', 'String')
  .field('uri', 'String')
  .computed('accountSid', 'String')
  .computed('apiVersion', 'String')
  .computed('numSegments', 'Int')
  .computed('numMedia', 'Int')
  .computed('dateCreated', 'String')
  .computed('dateSent', 'String')
  .computed('dateUpdated', 'String')
  .computed('errorCode', 'String')
  .computed('errorMessage', 'String')
