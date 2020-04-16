const { Router } = require('express');
const UserController = require('./controllers');
const userController = new UserController();

const router = Router();

router.post('/register', userController.validateCreateUser, userController.createUser);
router.post('/login', userController.validateLogin, userController.login);

module.exports = router;