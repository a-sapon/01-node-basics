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
// const path = require('path');
// const shortId = require('shortid');
// const multer  = require('multer');

// const storage = multer.diskStorage({
//   destination: 'draft',
//   filename: function (req, file, cb) {
//     const filename = shortId();
//     const ext = path.parse(file.originalname).ext;
//     cb(null, filename + ext);
//   }
// })

// const upload = multer({storage});

const router = Router();

router.get('/', listContacts);
router.get('/:contactId', validateId, getContactById);
router.post('', addContact);
router.delete('/:contactId', validateId, removeContact);
router.patch('/:contactId', validateId, validateInfoForUpdate, updateContact);

// router.post('/upload', upload.single('file_example'), minifyImg, (req, res) => {
//   console.log('req.file', req.file);

//   res.status(200).send();
// })

module.exports = router;
