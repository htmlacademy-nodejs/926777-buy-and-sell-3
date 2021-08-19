'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {getLogger} = require(`../lib/logger`);
const sequelize = require(`../lib/sequelize`);
// const defineModels = require(`../models`);
// const Aliase = require(`../models/aliase`);
const initDatabase = require(`../lib/init-db`);

const {
  getRandomInt,
  shuffle,
} = require(`../../utils`);

const logger = getLogger({name: `api`});

// данные по умолчанию
const DEFAULT_COUNT = 1;
const MAX_COMMENTS = 4;

const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const OfferType = {
  OFFER: `offer`,
  SALE: `sale`,
};

const SumRestrict = {
  MIN: 1000,
  MAX: 100000,
};

const PictureRestrict = {
  min: 1,
  max: 16,
};

const getPictureFileName = (number) => number > 10 ? `item${number}.jpg` : `item0${number}.jpg`;

const generateComments = (count, comments) => (
  Array(count).fill({}).map(() => ({
    text: shuffle(comments)
      .slice(0, getRandomInt(1, 3))
      .join(` `),
  }))
);

const getRandomSubarray = (items) => {
  items = items.slice();
  let count = getRandomInt(1, items.length - 1);
  const result = [];
  while (count--) {
    result.push(
        ...items.splice(
            getRandomInt(0, items.length - 1), 1
        )
    );
  }
  return result;
};

const generateOffers = (count, titles, categories, sentences, comments) => (
  Array(count).fill({}).map(() => ({
    categories: getRandomSubarray(categories),
    description: shuffle(sentences).slice(1, 5).join(` `),
    picture: getPictureFileName(getRandomInt(PictureRestrict.MIN, PictureRestrict.MAX)),
    title: titles[getRandomInt(0, titles.length - 1)],
    type: Object.keys(OfferType)[Math.floor(Math.random() * Object.keys(OfferType).length)],
    sum: getRandomInt(SumRestrict.MIN, SumRestrict.MAX),
    comments: generateComments(getRandomInt(1, MAX_COMMENTS), comments),
  }))
);

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.trim().split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

module.exports = {
  name: `--filldb`,
  async run(args) {
    try {
      logger.info(`Trying to connect to database...`);
      await sequelize.authenticate();
    } catch (err) {
      logger.error(`An error occurred: ${err.message}`);
      process.exit(1);
    }
    logger.info(`Connection to database established`);

    // const {Category, Offer} = defineModels(sequelize);
    // await sequelize.sync({force: true}); // Опция force означает, что sequelize при необходимости уничтожит существующие таблицы в базе данных и создаст новые.

    const sentences = await readContent(FILE_SENTENCES_PATH);
    const titles = await readContent(FILE_TITLES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);
    const comments = await readContent(FILE_COMMENTS_PATH);

    // const categoryModels = await Category.bulkCreate(
    //     categories.map((item) => ({name: item}))
    // );

    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const offers = generateOffers(countOffer, titles, sentences, comments);
    // const offerPromises = offers.map(async (offer) => {
    //   const offerModel = await Offer.create(offer, {include: [Aliase.COMMENTS]});
    //   await offerModel.addCategories(offer.categories);
    // });
    // await Promise.all(offerPromises);
    return initDatabase(sequelize, {offers, categories});
  }
};
