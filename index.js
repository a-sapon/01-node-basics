const {listContacts,getContactById,addContact,removeContac} = require('./contacts');
const argv = require('yargs').argv;

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      console.table(listContacts());
      break;

    case 'get':
      console.log(getContactById(id));
      break;

    case 'add':
      addContact(name, email, phone);
      console.log('New contact added!');
      break;

    case 'remove':
      removeContact(id);
      console.log('Contact deleted');
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);