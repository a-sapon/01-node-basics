const express = require('express');
const cors = require('cors');
const contactsRoutes = require('./contacts/routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(contactsRoutes);

app.listen(3030, () => {
  console.log('Server is nunning on port 3030');
});

module.exports = class UserServer {
  constructor() {
    this.server = null;
  }


}

// 1. server
// 2. middlewares
// 3. routes
// 4. db
// 5. listening