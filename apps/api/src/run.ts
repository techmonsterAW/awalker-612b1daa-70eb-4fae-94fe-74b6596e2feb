/**
 * Entry point: load .env before any other module so DATABASE_URL is set
 * when TypeORM/AppModule is loaded.
 */
require('dotenv').config({
  path: require('path').join(__dirname, '..', '..', '..', '.env'),
});
require('./main');
