const Joi = require('joi');
const contactModel = require('./model');
const {
  Types: { ObjectId }
} = require('mongoose');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

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

async function updateContact(req, res, next) {
  const { contactId } = req.params;
  try {
    const targetContact = await contactModel.findByIdAndUpdate(
      contactId,
      req.body,
      { new: true }
    );
    targetContact
      ? res.status(200).json(targetContact)
      : res.status(404).send();
  } catch (err) {
    next(err);
  }
}

function validateInfoForUpdate(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: 'missing fields' });
  }

  const schema = Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    phone: Joi.string().regex(/^[0-9\- ]{10,20}$/)
  });

  const { error, value } = Joi.validate(req.body, schema);
  error ? res.status(400).json({ message: error.details[0].message }) : next();
}

function validateId(req, res, next) {
  const { contactId } = req.params;
  ObjectId.isValid(contactId) ? next() : res.status(400).send();
}

// async function minifyImg(req, res, next) {
//   try{await imagemin([`${req.file.path}`], {
//     destination: 'uploads',
//     plugins: [
//       imageminJpegtran(),
//       imageminPngquant({
//         quality: [0.6, 0.8]
//       })
//     ]
//   });

//   req.file.path = path.join('uploads', req.file.filename);
//   req.file.destination = 'uploads'

//   console.log('minified');
//   next();}catch(err) {next(err)}
// }

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  validateInfoForUpdate,
  validateId
};
