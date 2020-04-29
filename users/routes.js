const { Router } = require('express');
const UserController = require('./controllers');
const userController = new UserController();
const path = require('path');
const shortId = require('shortid');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'tmp',
  filename: function (req, file, cb) {
    const ext = path.parse(file.originalname).ext;
    cb(null, shortId() + ext);
  }
});

const upload = multer({ storage });

const router = Router();

router.post(
  '/auth/register',
  userController.validateCreateUser,
  userController.createUser
);
router.post('/auth/login', userController.validateLogin, userController.login);
router.post('/auth/logout', userController.verifyToken, userController.logout);
router.get('/current', userController.verifyToken, userController.getUser);
router.patch(
  '/avatars',
  userController.verifyToken,
  upload.single('custom_avatar'),
  userController.minifyImg,
  userController.changeAvatar
);

router.get('/otp/:otpCode', userController.completeRegister);

module.exports = router;
