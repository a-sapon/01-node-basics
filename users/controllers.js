const Joi = require('joi');
const userModel = require('./model');
const bcypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

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

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      await userModel.findByIdAndUpdate(user._id, { $set: { token } });
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

  async verifyToken(req, res, next) {
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const token = authorizationHeader.replace('Bearer ', '');
    try {
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      const user = await userModel.findById(userId);
      if (!user || user.token !== token) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  async logout(req, res, next) {
    try {
      await userModel.findByIdAndUpdate(req.user._id, { token: null });
      res.status(200).json({ message: 'Logout success' });
    } catch (err) {
      next(err);
    }
  }

  async getUser(req, res, next) {
    try {
      const user = await userModel.findById(req.user._id);
      res
        .status(200)
        .json({ email: user.email, subscription: user.subscription });
    } catch (err) {
      next(err);
    }
  }

  minifyImg(req, res, next) {
  try{await imagemin([`${req.file.path}`], {
    destination: 'public/images',
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  });

  req.file.path = path.join('public', 'images', req.file.filename);
  req.file.destination = 'public/images'

  console.log('minified');
  next();}catch(err) {next(err)}
}
};
