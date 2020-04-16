const { Router } = require('express');
const UserController = require('./controllers');
const userController = new UserController();

const router = Router();

router.post('/register', userController.validateAuthInfo, userController.createUser);
router.post('/login');

module.exports = router;