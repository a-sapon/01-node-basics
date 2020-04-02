const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.listen(3030, () => {
  console.log('Server is running on port 3030...');
});
