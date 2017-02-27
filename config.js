exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       'mongodb://localhost/hn-api';

exports.TEST_DATABASE_URL = (
  process.env.TEST_DATABASE_URL ||
  'mongodb://localhost/test-hn-api');
exports.PORT = process.env.PORT || 8080;
