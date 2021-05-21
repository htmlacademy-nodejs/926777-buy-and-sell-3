'use strict';

const chalk = require(`chalk`);
const express = require(`express`);
const {
  HttpCode,
  API_PREFIX
} = require(`../../constants`);

const createApiRouter = require(`../api`);

const DEFAULT_PORT = 3000;

const createApp = async () => {
  const app = express();
  app.use(express.json());
  app.use(API_PREFIX, await createApiRouter());
  app.use((req, res) => res
    .status(HttpCode.NOT_FOUND)
    .send(`Not found`));

  return app;
};

module.exports = {
  name: `--server`,
  async run(args) {
    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || DEFAULT_PORT;
    const app = await createApp();
    app.listen(port)
        .on(`listening`, () => {
          console.info(chalk.green(`Ожидаю соединений на ${port}`));
        })
        .on(`error`, (err) => {
          console.error(`Произошла ошибка: ${err.message}`);
          process.exit(1);
        });
  }
};

