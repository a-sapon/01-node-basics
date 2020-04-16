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
      const { email, password, subscription } = req.body;
      const existEmail = await userModel.findOne({ email });
      if (existEmail) {
        return res.status(400).json({ message: 'Email in use' });
      }

      const hashPassword = await bcypt.hash(password, this.saltRounds);
      const newUser = await userModel.create({
        email,
        password: hashPassword,
        subscription
      });
      await newUser.save((err, savedUser) => {
        err
          ? res.status(400).json(err.message)
          : res.status(201).json({
              token: jwt.sign({ id: savedUser._id }, 'shhhhh'),
              user: {
                email: savedUser.email,
                subscription: savedUser.subscription
              }
            });
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email not registered' });
      }
      const validPassword = await bcypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      const token = jwt.sign({ id: user._id }, 'shhhhh');
      res.status(200).json({
        token,
        user: {
          email: user.email,
          subscription: user.subscription
        }
      });
    } catch (err) {
      next(err);
    }
  }

  validateCreateUser(req, res, next) {
    if (Object.keys(req.body).length === 0) {
      res.status(422).json({ message: 'Missing required fields' });
    }

    const schema = Joi.object().keys({
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
      subscription: Joi.string()
    });

    const { error, value } = Joi.validate(req.body, schema);
    error
      ? res.status(422).json({ message: error.details[0].message })
      : next();
  }

  validateLogin(req, res, next) {
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
};
