const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerSpec = require('./swagger');
const swaggerUi = require('swagger-ui-express');
dotenv.config();
require('./api/check-interval');
require('./database/db');
const port = process.env.PORT || 3000;

const restApi = express();

const api = require('./api');

restApi.use(express.urlencoded({ extended: true }));
restApi.use(express.json());
restApi.use(cors());

restApi.use("/", express.static('./interface/build', { 'Content-Type': 'application/javascript' }));
restApi.use("/login", express.static('./interface/build', { 'Content-Type': 'application/javascript' }));
restApi.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

restApi.use('/api', api);
restApi.listen(port, () => {
  console.log(`🟢 Server is up at port :${port}`);
  console.log("");
});

module.exports = restApi;