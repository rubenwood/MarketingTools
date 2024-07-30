const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();

const { namesRouter } = require('./other/check-marketing-name.js');

app.use(express.static('public'));
app.use('/names', namesRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} == ^_^ ==`);
});