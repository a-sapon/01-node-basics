const express = require('express');
require('dotenv').config();
const cors = require('cors');
const contactRouter = require('./contacts/routes');
const userRouter = require('./users/routes');
const mongoose = require('mongoose');

module.exports = class UserServer {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.initDB();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(express.static('public'));
    this.server.use(express.static('tmp'));
  }

  initRoutes() {
    this.server.use('/api/contacts', contactRouter);
    this.server.use('/api/users' , userRouter);
  }

  async initDB() {
    try {
      await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Database connection successful');
    } catch (err) {
      console.log(err);
    }

    mongoose.connection.on('error', err => {
      console.log(err);
      process.exit(1)
    });
  }

  startListening() {
    this.server.listen(3030, () => {
      console.log('Server is nunning on port 3030');
    });
  }
};
