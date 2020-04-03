const { Router } = require('express');
const {
  listContacts,
  getContactById,
  validateData,
  addContact,
  removeContact,
  updateContact
} = require('./controllers');

const router = Router();

router.get('/api/contacts', listContacts);
router.get('/api/contacts/:contactId', getContactById);
router.post('/api/contacts', validateData, addContact);
router.delete('/api/contacts/:contactId', removeContact);
router.patch('/api/contacts/:contactId', updateContact);

module.exports = router;
