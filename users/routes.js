const { Router } = require('express');
const UserController = require('./controllers');
const userController = new UserController();
const path = require('path');
const shortId = require('shortid');
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: 'tmp',
  filename: function (req, file, cb) {
    const ext = path.parse(file.originalname).ext;
    cb(null, shortId() + ext);
  }
})

const upload = multer({storage});

const router = Router();

router.post(
  '/auth/register',
  userController.validateCreateUser,
  upload.single('file_example'),
  userController.createUser
);
router.post('/auth/login', userController.validateLogin, userController.login);
router.post('/auth/logout', userController.verifyToken, userController.logout);
router.get('/current', userController.verifyToken, userController.getUser);

module.exports = router;
