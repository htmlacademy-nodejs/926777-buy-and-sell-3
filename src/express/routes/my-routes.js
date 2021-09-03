'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const {asyncMiddleware} = require(`../../utils`);

const myRouter = new Router();

myRouter.get(`/`, asyncMiddleware(async (req, res) => {
  const offers = await api.getOffers({comments: true});
  res.render(`my-tickets`, {offers});
}));

myRouter.get(`/comments`, asyncMiddleware(async (req, res) => {
  const offers = await api.getOffers({comments: true});
  res.render(`comments`, {offers: offers.slice(0, 3)});
}));

module.exports = myRouter;
