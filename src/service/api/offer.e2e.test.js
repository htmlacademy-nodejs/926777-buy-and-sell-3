'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../lib/init-db`);
const offer = require(`./offer`);
const DataService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);

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

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDB(mockDB, {categories: mockCategories, offers: mockData});
  const app = express();
  app.use(express.json());
  offer(app, new DataService(mockDB), new CommentService(mockDB));
  return app;
};

// Проверим, что мы можем получить список объявлений, а также отдельное объявление по его id.
describe(`API returns a list of all offers`, () => {
  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 3 offers`, () => expect(response.body.length).toBe(3));
  test(`First offer's title equals "Продам новую приставку"`, () => expect(response.body[0].title).toBe(`Продам новую приставку`));
});

describe(`API returns an offer with given id`, () => {
  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer's title is "Продам новую приставку"`, () => expect(response.body.title).toBe(`Продам новую приставку`));
});

// протестируем создание объявлений
describe(`API creates an offer if data is valid`, () => {
  const newOffer = {
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Offers count is changed`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(4))
  );
});

// проверим негативный сценарий. Ошибка валидации возникает, если в объекте объявления не хватает одного из шести важных свойств.
describe(`API refuses to create an offer if data is invalid`, () => {
  const newOffer = {
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newOffer)) {
      const badOffer = {...newOffer};
      delete badOffer[key];
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpCode.BAD_REQUEST);
    }
  });
});

// тест для проверки возможности изменения объявления
// положительный сценарий
describe(`API changes existent offer`, () => {
  const newOffer = {
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/offers/1`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer is really changed`, () => request(app)
    .get(`/offers/1`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );
});

// негативные сценарии: попытку изменить несуществующее объявление и передачу невалидного объекта нового объявления.
// test(`API returns status code 404 when trying to change non-existent offer`, async () => {
//   const app = await createAPI();
//   const validOffer = {
//     id: 1,
//     title: `Это валидный`,
//     description: `объект`,
//     picture: `объявления`,
//     type: `однако`,
//     sum: 404,
//   };

//   return request(app)
//     .put(`/offers/20`)
//     .send(validOffer)
//     .expect(HttpCode.NOT_FOUND);
// });

test(`API returns status code 400 when trying to change an offer with invalid data`, async () => {
  const app = await createAPI();
  const invalidOffer = {
    category: `Это`,
    title: `невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля sum`
  };

  return request(app)
    .put(`/offers/NOEXST`)
    .send(invalidOffer)
    .expect(HttpCode.BAD_REQUEST);
});

// проверка удаления объявления. Один позитивный сценарий (удаление существующего объявления) и один негативный (удаление несуществующего).
describe(`API correctly deletes an offer`, () => {
  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer count is 2 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(2))
  );
});

test(`API refuses to delete non-existent offer`, async () => {
  const app = await createAPI();

  return request(app)
    .delete(`/offers/NOEXST`)
    .expect(HttpCode.NOT_FOUND);
});

// тесты для комментариев
describe(`API returns a list of comments to given offer`, () => {
  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Status code 200`, () => console.log(response.body));
  // test(`Returns list of 2 comments`, () => expect(response.body.length).toBe(2));
  test(`First comment's text is "Совсем немного... Оплата наличными или перевод на карту?`, () => expect(response.body.comments[0].text).toBe(`Совсем немного... Оплата наличными или перевод на карту?`));
});

// describe(`API creates a comment if data is valid`, () => {
//   const newComment = {
//     text: `Валидному комментарию достаточно этого поля`
//   };
//   let app;
//   let response;

//   beforeAll(async () => {
//     app = await createAPI();
//     response = await request(app)
//       .post(`/offers/1/comments`)
//       .send(newComment);
//   });

//   test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
//   test(`Comments count is changed`, () => request(app)
//     .get(`/offers/1/comments`)
//     .expect((res) => expect(res.body.length).toBe(1))
//   );
// });

// test(`API refuses to create a comment to non-existent offer and returns status code 404`, async () => {
//   const app = await createAPI();
//   return request(app)
//     .post(`/offers/NOEXST/comments`)
//     .send({
//       text: `Неважно`
//     })
//     .expect(HttpCode.NOT_FOUND);
// });

// test(`API refuses to create a comment when data is invalid, and returns status code 400`, () => {
//   const app = createAPI();

//   return request(app)
//     .post(`/offers/8YlHaa/comments`)
//     .send({})
//     .expect(HttpCode.BAD_REQUEST);
// });

// describe(`API correctly deletes a comment`, () => {
//   const app = createAPI();
//   let response;

// beforeAll(async () => {
//   response = await request(app)
//     .delete(`/offers/8YlHaa/comments/TLoAah`);
// });

// test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
// test(`Returns comment deleted`, () => expect(response.body.id).toBe(`TLoAah`));
// test(`Comments count is 3 now`, () => request(app)
//   .get(`/offers/8YlHaa/comments`)
//   .expect((res) => expect(res.body.length).toBe(1))
// );
// });

// test(`API refuses to delete non-existent comment`, () => {
//   const app = createAPI();

//   return request(app)
//     .delete(`/offers/8YlHaa/comments/NOEXST`)
//     .expect(HttpCode.NOT_FOUND);
// });

// test(`API refuses to delete a comment to non-existent offer`, async () => {
//   const app = await createAPI();
//   return request(app)
//     .delete(`/offers/20/comments/kqME9j`)
//     .expect(HttpCode.NOT_FOUND);
// });
