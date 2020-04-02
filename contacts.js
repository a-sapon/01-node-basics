const fs = require('fs');
const path = require('path');
const shortId = require('shortid');

const contactsPath = path.join(__dirname, 'db', 'contacts.json');

function listContacts() {
  const result = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));
  return result;
}

function getContactById(contactId) {
  const contactsArr = listContacts();
  return contactsArr.find(item => item.id === contactId);
}

function addContact(name, email, phone) {
  const updatedContactsArr = [
    ...listContacts(),
    { id: shortId(), name, email, phone }
  ];
  fs.writeFile(contactsPath, JSON.stringify(updatedContactsArr), err => {
    if (err) throw err;
  });
}

function removeContact(contactId) {
  const contactsArr = listContacts();
  const updatedContactsArr = contactsArr.filter(item => item.id !== contactId);
  fs.writeFile(contactsPath, JSON.stringify(updatedContactsArr), err => {
    if (err) throw err;
  });
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact
};
