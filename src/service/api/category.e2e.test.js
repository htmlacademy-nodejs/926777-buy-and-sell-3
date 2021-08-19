'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../lib/init-db`);
const category = require(`./category`);
const DataService = require(`../data-service/category`);

const {HttpCode} = require(`../../constants`);

const mockCategories = [`Книги`, `Посуда`, `Игры`];

const mockData = [
  {
    "categories": [`Книги`, `Посуда`],
    "description": `Это настоящая находка для коллекционера! Если найдёте дешевле — сброшу цену. Товар в отличном состоянии. Если товар не понравится — верну всё до последней копейки.`,
    "picture": `item0NaN.jpg`,
    "title": `Продам новую приставку`,
    "type": `SALE`,
    "sum": 75179,
    "comments": [
      {"text": `Совсем немного... Оплата наличными или перевод на карту?`},
      {"text": `А сколько игр в комплекте?`}
    ]
  },
  {
    "categories": [`Посуда`],
    "description": `Пользовались бережно и только по большим праздникам. Таких предложений больше нет! Даю недельную гарантию. Если найдёте дешевле — сброшу цену.`,
    "picture": `item0NaN.jpg`,
    "title": `a`,
    "type": `SALE`,
    "sum": 64926,
    "comments": [
      {"text": `Почему в таком ужасном состоянии? С чем связана продажа? Почему так дешёво?`},
      {"text": `Продаю в связи с переездом. Отрываю от сердца. А где блок питания? Почему в таком ужасном состоянии?`},
      {"text": `Вы что?! В магазине дешевле.`},
      {"text": `А где блок питания?`}
    ]
  },
  {
    "categories": [`Игры`],
    "description": `Товар в отличном состоянии. При покупке с меня бесплатная доставка в черте города. Если товар не понравится — верну всё до последней копейки. Продаю с болью в сердце...`,
    "picture": `item0NaN.jpg`,
    "title": `t`,
    "type": `OFFER`,
    "sum": 67459,
    "comments": [
      {"text": `С чем связана продажа? Почему так дешёво? Оплата наличными или перевод на карту?`}
    ]
  }
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockData});
  category(app, new DataService(mockDB));
});

describe(`API returns category list`, () => {
  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 3 categories`, () => expect(response.body.length).toBe(3));
  test(`Category names are "Книги", "Посуда", "Игры"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Книги`, `Посуда`, `Игры`])
      )
  );
});

