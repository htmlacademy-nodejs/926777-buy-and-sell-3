'use strict';

const express = require(`express`);
const request = require(`supertest`);

const search = require(`./search`);
const DataService = require(`../data-service/search`);

const {HttpCode} = require(`../../constants`);

const mockData = [
  {
    "id": `ZzWxwm`,
    "category": [`Книги`],
    "description": `Это настоящая находка для коллекционера! Если найдёте дешевле — сброшу цену. Товар в отличном состоянии. Если товар не понравится — верну всё до последней копейки.`,
    "picture": `item0NaN.jpg`,
    "title": `Продам новую приставку`,
    "type": `SALE`,
    "sum": 75179,
    "comments": [
      {
        "id": `ObCgRL`,
        "text": `Совсем немного... Оплата наличными или перевод на карту?`
      }, {
        "id": `x-tTje`,
        "text": `А сколько игр в комплекте?`
      }
    ]
  },
  {
    "id": `9Mi3Z9`,
    "category": [`Посуда`],
    "description": `Пользовались бережно и только по большим праздникам. Таких предложений больше нет! Даю недельную гарантию. Если найдёте дешевле — сброшу цену.`,
    "picture": `item0NaN.jpg`,
    "title": `a`,
    "type": `SALE`,
    "sum": 64926,
    "comments": [
      {
        "id": `kwTv1e`,
        "text": `Почему в таком ужасном состоянии? С чем связана продажа? Почему так дешёво?`
      }, {
        "id": `RwL0uf`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. А где блок питания? Почему в таком ужасном состоянии?`
      }, {
        "id": `-5t4WU`,
        "text": `Вы что?! В магазине дешевле.`
      }, {
        "id": `AeNYr0`,
        "text": `А где блок питания?`
      }
    ]
  },
  {
    "id": `8YlHaa`,
    "category": [`Игры`],
    "description": `Товар в отличном состоянии. При покупке с меня бесплатная доставка в черте города. Если товар не понравится — верну всё до последней копейки. Продаю с болью в сердце...`,
    "picture": `item0NaN.jpg`,
    "title": `t`,
    "type": `OFFER`,
    "sum": 67459,
    "comments": [
      {
        "id": `TLoAah`,
        "text": `С чем связана продажа? Почему так дешёво? Оплата наличными или перевод на карту?`
      }
    ]
  }
];

const app = express();
app.use(express.json());
search(app, new DataService(mockData));

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
  test(`Offer has correct id`, () => expect(response.body[0].id).toBe(`ZzWxwm`));
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

