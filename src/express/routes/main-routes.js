'use strict';

const {Router} = require(`express`);
const {asyncMiddleware} = require(`../../utils`);
const api = require(`../api`).getAPI();

const mainRouter = new Router();

mainRouter.get(`/`, asyncMiddleware(async (req, res) => {
  const [
    offers,
    categories
  ] = await Promise.all([
    api.getOffers({comments: true}),
    api.getCategories(true) // опциональный аргумент
  ]);

  res.render(`main`, {offers, categories});
}));

mainRouter.get(`/register`, (req, res) => res.render(`sign-up`));

mainRouter.get(`/login`, (req, res) => res.render(`login`));

mainRouter.get(`/search`, asyncMiddleware(async (req, res) => {
  try {
    const {search} = req.query;
    const results = await api.search(search);
    res.render(`search-result`, {
      results
    });
  } catch (error) {
    res.render(`search-result`, {
      results: []
    });
  }
}));

module.exports = mainRouter;
