'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const search = require(`./search`);
const DataService = require(`../data-service/search`);
const initDB = require(`../lib/init-db`);
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
  search(app, new DataService(mockDB));
});


describe(`API returns offer based on search query`, () => {
  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/search`)
      .query({
        query: `Продам новую приставку`
      });
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`1 offer found`, () => expect(response.body.length).toBe(1));
  test(`Offer has correct title`, () => expect(response.body[0].title).toBe(`Продам новую приставку`));
});

test(`API returns code 404 if nothing is found`,
    () => request(app)
      .get(`/search`)
      .query({
        query: `Продам свою душу`
      })
      .expect(HttpCode.NOT_FOUND)
);

test(`API returns 400 when query string is absent`,
    () => request(app)
      .get(`/search`)
      .expect(HttpCode.BAD_REQUEST)
);
