// Database Configuration (for future use)
// Currently using AWS services, but this file is prepared for future database needs

const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'voiceaid_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true
  }
};

module.exports = dbConfig[process.env.NODE_ENV || 'development'];
