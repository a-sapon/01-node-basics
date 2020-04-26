const userModel = require('./model');
const fs = require('fs');
const {promises: fsPromises} = require('fs');
const path = require('path');
const Joi = require('joi');
const bcypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const Avatar = require('avatar-builder');
const avatar = Avatar.identiconBuilder(128);
const shortId = require('shortid');

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
      const newAvatar = `avatar_${shortId()}.png`;
      avatar
        .create('gabriel')
        .then(buffer => fs.writeFileSync(`./tmp/${newAvatar}`, buffer));
      const newUser = await userModel.create({
        email,
        password: hashPassword,
        subscription,
        avatarURL: `http://localhost:3030/${newAvatar}`
      });
      await newUser.save((err, savedUser) => {
        err
          ? res.status(400).json(err.message)
          : res.status(201).json({
              user: {
                email: savedUser.email,
                subscription: savedUser.subscription,
                avatarURL: savedUser.avatarURL
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
          subscription: user.subscription,
          avatarURL: user.avatarURL
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

  async minifyImg(req, res, next) {
    try {
      const parsedUrl = req.user.avatarURL.split('/');
      const oldAvatar = parsedUrl[parsedUrl.length - 1];
      await fsPromises.unlink(`tmp/${oldAvatar}`);
      
      await imagemin([`tmp/${req.file.filename}`], {
        destination: ('public/images'),
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8]
          })
        ]
      });

      const { filename, path: tmpPath } = req.file;
      req.file.path = path.join(__dirname, '..', 'public', 'images', filename);
      req.file.destination = path.join(__dirname, '..', 'public', 'images');
      await fsPromises.unlink(tmpPath);
      next();
    } catch (err) {
      next(err);
    }
  }

  async changeAvatar(req, res, next) {
    try {
      await userModel.findByIdAndUpdate(
        req.user._id,
        { avatarURL: req.file.path }
      );
      res.status(201).json({message: 'Avatar changed'});
    } catch (err) {
      next(err);
    }
  }
};
