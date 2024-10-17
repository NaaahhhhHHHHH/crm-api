const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'CRM API',
    description: 'API for CRM Management',
  },
  host: 'localhost:5000',
  schemes: ['http'], 
  tags: [
    {
      "name": "customer",
      "description": "API for managing customer"
    },
    {
      "name": "service",
      "description": "API for managing service"
    },
    {
      "name": "form",
      "description": "API for managing form"
    },
    {
      "name": "employee",
      "description": "API for managing employee"
    },
    {
      "name": "job",
      "description": "API for managing gallery"
    },
    {
      "name": "owner",
      "description": "API for managing owner"
    },
    {
      "name": "auth",
      "description": "API for managing auth"
    },
    {
      "name": "assignment",
      "description": "API for managing assignment"
    }
  ],
};

const outputFile = './swagger-output.json';
const routes = [
    './routes/customerRoute.js',
    './routes/serviceRoute.js',
    './routes/formRoute.js',
    './routes/employeeRoute.js',
    './routes/jobRoute.js',
    './routes/ownerRoute.js',
    './routes/authRoute.js',
    './routes/assignmentRoute.js',
];

swaggerAutogen(outputFile, routes, doc);