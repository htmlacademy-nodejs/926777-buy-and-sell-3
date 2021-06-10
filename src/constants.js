'use strict';

module.exports.DEFAULT_COMMAND = `--help`;

// 3ий аргумент process.argv[2]
module.exports.USER_ARGV_INDEX = 2;

module.exports.ExitCode = {
  ERROR: 1,
  SUCCESS: 0,
};

module.exports.MAX_COUNT = 1000;

module.exports.HttpCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
};

module.exports.MAX_ID_LENGTH = 6;

module.exports.API_PREFIX = `/api`;

module.exports.Env = {
  DEVELOPMENT: `development`,
  PRODUCTION: `production`
};


