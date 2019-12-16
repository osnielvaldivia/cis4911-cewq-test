const express = require('express');
const connectDB = require('./config/db');
const swaggerJSDoc = require('swagger-jsdoc');
const jsYaml = require('js-yaml');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const app = express();

// Swagger
const openApiDocument = jsYaml.safeLoad(
  fs.readFileSync('./spec/api.yaml', 'utf-8')
);
const options = {
  swaggerDefinition: openApiDocument,
  apis: ['./**/routes/*.js', 'routes.js'],
};
const swaggerSpec = swaggerJSDoc(options);

// Connect Database;
connectDB();

// Init Middleware
app.use(
  express.json({
    extended: false,
  })
);

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/company', require('./routes/api/company'));
app.use('/api/employee', require('./routes/api/employee'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

module.exports = server;
