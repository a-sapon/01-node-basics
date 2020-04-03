const express = require('express');
const cors = require('cors');
// const morgan = require('morgan');
const contactsRoutes = require('./contacts/routes');

const app = express();

app.use(cors());
// app.use(morgan('tiny'));
app.use(express.json());
app.use(contactsRoutes);

// morgan(':method :host :status :param[id] :res[content-length] - :response-time ms');

app.listen(3030, () => {
  console.log('Server is nunning on port 3030');
});