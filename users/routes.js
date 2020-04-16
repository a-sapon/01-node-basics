const { Router } = require('express');
const UserController = require('./controllers');
const userController = new UserController();

const router = Router();

router.post('/auth/register', userController.validateAuthInfo, userController.createUser);

module.exports = router;