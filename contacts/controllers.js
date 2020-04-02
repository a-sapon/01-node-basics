const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const contactsPath = path.join(__dirname, '../', 'db', 'contacts.json');
const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));

function listContacts(req, res) {
  res.status(200).json(contacts);
}

function getContactById(req, res) {
  const id = Number(req.params.contactId);
  const targetContact = contacts.find(item => item.id === id);
  res.status(200).json(targetContact);
}

function validateData(req, res, next) {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    phone: Joi.string()
      .regex(/^[0-9\- ]{10,20}$/)
      .required()
  });

  const { error, value } = Joi.validate(req.body, schema);
  error ? res.status(400).json({ message: error.details[0].message }) : next();
}

function addContact(req, res) {
  const { name, email, phone } = req.body;
  const newContact = { id: Date.now(), name, email, phone };
  const updatedContactsArr = [...contacts, newContact];
  fs.writeFile(contactsPath, JSON.stringify(updatedContactsArr), err => {
    if (err) throw err;
  });
  res.status(201).json(newContact);
}

function removeContact(req, res) {
  const id = Number(req.params.contactId);
  const targetContact = contacts.find(item => item.id === id);
  const updatedContacts = contacts.filter(item => item.id !== id);
  if (targetContact) {
    fs.writeFile(contactsPath, JSON.stringify(updatedContacts), err => {
      if (err) throw err;
    });
    res.status(200).json({ message: 'contact deleted' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
}

module.exports = {
  listContacts,
  getContactById,
  validateData,
  removeContact,
  addContact
};
