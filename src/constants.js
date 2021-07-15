'use strict';

const DEFAULT_COMMAND = `--help`;

// 3ий аргумент process.argv[2]
const USER_ARGV_INDEX = 2;

const ExitCode = {
  ERROR: 1,
  SUCCESS: 0,
};

const MAX_COUNT = 1000;

const HttpCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
};

const MAX_ID_LENGTH = 6;

const API_PREFIX = `/api`;

const Env = {
  DEVELOPMENT: `development`,
  PRODUCTION: `production`
};

module.exports = {
  DEFAULT_COMMAND,
  USER_ARGV_INDEX,
  ExitCode,
  MAX_COUNT,
  HttpCode,
  MAX_ID_LENGTH,
  API_PREFIX,
  Env
};


