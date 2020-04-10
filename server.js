const express = require('express');
require('dotenv').config();
const cors = require('cors');
const contactsRoutes = require('./contacts/routes');
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
  }

  initRoutes() {
    this.server.use('/api/contacts', contactsRoutes)
  }

  async initDB() {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to DB')
  }

  startListening() {
    this.server.listen(3030, () => {
      console.log('Server is nunning on port 3030');
    })
  }
}