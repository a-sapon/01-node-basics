const Joi = require('joi');
const userModel = require('./model');
const bcypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = class UserController {
  constructor() {
    this.saltRounds = 3;
  }

  get createUser() {
    return this._createUser.bind(this);
  }

  async _createUser(req, res, next) {
    try {
      const { email, password, subscription, token } = req.body;
      // this.validateEmail

      const hashPassword = await bcypt.hash(password, this.saltRounds);
      const newUser = await userModel.create({
        email,
        password: hashPassword,
        subscription,
        token
      });
      await newUser.save((err, savedUser) => {
        err
          ? res.status(400).json(err.message)
          : res.status(201).json({
            token: '',
            user: {
              email: savedUser.email,
              subscription: savedUser.subscription,
              id: savedUser._id
            }
          });
      });
    } catch (err) {
      next(err);
    }
  }

  validateAuthInfo(req, res, next) {
    if (Object.keys(req.body).length === 0) {
      res.status(422).json({ message: 'Missing required fields' });
    }

    const schema = Joi.object().keys({
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    error
      ? res.status(422).json({ message: error.details[0].message })
      : next();
  }

  validateEmail(req, res, next) {
    const { email } = req.body;
    const existingEmail = userModel.findOne({ email });
    existingEmail ? res.status(400).json({ message: 'Email in use' }) : next();
  }
};
