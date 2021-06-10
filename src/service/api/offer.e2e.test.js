'use strict';

const express = require(`express`);
const request = require(`supertest`);

const offer = require(`./offer`);
const DataService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);

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

const createAPI = () => {
  const app = express();
  const cloneData = JSON.parse(JSON.stringify(mockData));
  app.use(express.json());
  offer(app, new DataService(cloneData), new CommentService());
  return app;
};

// Проверим, что мы можем получить список объявлений, а также отдельное объявление по его id.
describe(`API returns a list of all offers`, () => {
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 3 offers`, () => expect(response.body.length).toBe(3));
  test(`First offer's id equals "ZzWxwm"`, () => expect(response.body[0].id).toBe(`ZzWxwm`));
});

describe(`API returns an offer with given id`, () => {
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers/ZzWxwm`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer's title is "КПродам новую приставку"`, () => expect(response.body.title).toBe(`Продам новую приставку`));
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
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Returns offer created`, () => expect(response.body).toEqual(expect.objectContaining(newOffer)));
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
  const app = createAPI();

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
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/offers/ZzWxwm`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns changed offer`, () => expect(response.body).toEqual(expect.objectContaining(newOffer)));
  test(`Offer is really changed`, () => request(app)
    .get(`/offers/ZzWxwm`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );
});

// негативные сценарии: попытку изменить несуществующее объявление и передачу невалидного объекта нового объявления.
test(`API returns status code 404 when trying to change non-existent offer`, () => {
  const app = createAPI();
  const validOffer = {
    category: `Это`,
    title: `валидный`,
    description: `объект`,
    picture: `объявления`,
    type: `однако`,
    sum: 404
  };

  return request(app)
    .put(`/offers/NOEXST`)
    .send(validOffer)
    .expect(HttpCode.NOT_FOUND);
});

test(`API returns status code 400 when trying to change an offer with invalid data`, () => {
  const app = createAPI();
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
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/offers/ZzWxwm`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns deleted offer`, () => expect(response.body.id).toBe(`ZzWxwm`));
  test(`Offer count is 3 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(3))
  );
});

test(`API refuses to delete non-existent offer`, () => {
  const app = createAPI();

  return request(app)
    .delete(`/offers/NOEXST`)
    .expect(HttpCode.NOT_FOUND);
});

// тесты для комментариев
describe(`API returns a list of comments to given offer`, () => {
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers/8YlHaa/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 1 comments`, () => expect(response.body.length).toBe(1));
  test(`First comment's id is "TLoAah"`, () => expect(response.body[0].id).toBe(`TLoAah`));
});


describe(`API creates a comment if data is valid`, () => {
  const newComment = {
    text: `Валидному комментарию достаточно этого поля`
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/offers/8YlHaa/comments`)
      .send(newComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Returns comment created`, () => expect(response.body).toEqual(expect.objectContaining(newComment)));
  test(`Comments count is changed`, () => request(app)
    .get(`/offers/8YlHaa/comments`)
    .expect((res) => expect(res.body.length).toBe(2))
  );
});

test(`API refuses to create a comment to non-existent offer and returns status code 404`, () => {
  const app = createAPI();
  return request(app)
    .post(`/offers/NOEXST/comments`)
    .send({
      text: `Неважно`
    })
    .expect(HttpCode.NOT_FOUND);
});

test(`API refuses to create a comment when data is invalid, and returns status code 400`, () => {
  const app = createAPI();

  return request(app)
    .post(`/offers/8YlHaa/comments`)
    .send({})
    .expect(HttpCode.BAD_REQUEST);
});

describe(`API correctly deletes a comment`, () => {
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/offers/8YlHaa/comments/TLoAah`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns comment deleted`, () => expect(response.body.id).toBe(`TLoAah`));
  test(`Comments count is 3 now`, () => request(app)
    .get(`/offers/8YlHaa/comments`)
    .expect((res) => expect(res.body.length).toBe(1))
  );
});

test(`API refuses to delete non-existent comment`, () => {
  const app = createAPI();

  return request(app)
    .delete(`/offers/8YlHaa/comments/NOEXST`)
    .expect(HttpCode.NOT_FOUND);
});

test(`API refuses to delete a comment to non-existent offer`, () => {
  const app = createAPI();
  return request(app)
    .delete(`/offers/NOEXST/comments/kqME9j`)
    .expect(HttpCode.NOT_FOUND);
});
