const express = require('express');
require('dotenv').config();
const cors = require('cors');
const contactRouter = require('./contacts/routes');
const userRouter = require('./users/routes');
const chatRouter = require('./chats/routes');
const mongoose = require('mongoose');
const http = require('http');
const io = require('socket.io');

module.exports = class UserServer {
  constructor() {
    this.server = null;
    this.httpServer = null;
    this.io = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.initWsHandlers();
    this.initDB();
    this.startListening();
  }

  initServer() {
    this.server = express();
    this.httpServer = http.createServer(this.server);
    this.io = io(this.httpServer);
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
    this.server.use(chatRouter);
  }

  initWsHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('chat message', (msg) => {
        this.io.emit('chat message', msg);
      });
    });
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
    this.httpServer.listen(3030, () => {
      console.log('Server is nunning on port 3030');
    });
  }
};
