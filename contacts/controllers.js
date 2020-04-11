const contactModel = require('./model');
const {
  Types: { ObjectId },
} = require('mongoose');

async function listContacts(req, res, next) {
  try {
    const contacts = await contactModel.find();
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
}

async function getContactById(req, res, next) {
  const { contactId } = req.params;
  try {
    const targetContact = await contactModel.findById(contactId);
    targetContact
      ? res.status(200).json(targetContact)
      : res.status(404).send();
  } catch (err) {
    next(err);
  }
}

async function addContact(req, res, next) {
  try {
    const newContact = new contactModel(req.body);
    await newContact.save((err, savedContact) => {
      err
        ? res.status(400).json(err.message)
        : res.status(201).json(savedContact);
    });
  } catch (err) {
    next(err);
  }
}

async function removeContact(req, res, next) {
  const { contactId } = req.params;
  try {
    const targetContact = await contactModel.findByIdAndDelete(contactId);
    targetContact ? res.status(204).send() : res.status(404).send();
  } catch (err) {
    next(err);
  }
}

async function updateContact(req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: 'missing fields' });
  }
  const { contactId } = req.params;
  const targetContact = await contactModel.findByIdAndUpdate(contactId)
}

function validateId(req, res, next) {
  const { contactId } = req.params;
  ObjectId.isValid(contactId) ? next() : res.status(400).send();
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  validateId,
};
