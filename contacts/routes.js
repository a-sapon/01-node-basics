const { Router } = require('express');
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  validateInfoForUpdate,
  validateId
} = require('./controllers');

const router = Router();

router.get('/', listContacts);
router.get('/:contactId', validateId, getContactById);
router.post('', addContact);
router.delete('/:contactId', validateId, removeContact);
router.patch('/:contactId', validateId, validateInfoForUpdate, updateContact);

module.exports = router;
