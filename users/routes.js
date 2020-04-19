const { Router } = require('express');
const UserController = require('./controllers');
const userController = new UserController();

const router = Router();

router.post('/auth/register', userController.validateCreateUser, userController.createUser);
router.post('/auth/login', userController.validateLogin, userController.login);
router.post('/auth/logout', userController.verifyToken, userController.logout);
router.get('/current', userController.verifyToken, userController.getUser);

module.exports = router;