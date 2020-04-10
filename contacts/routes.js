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

router.get('/', listContacts);
router.get('/:contactId', getContactById);
router.post('', validateData, addContact);
router.delete('/:contactId', removeContact);
router.patch('/:contactId', updateContact);

module.exports = router;
