'use strict';

// функция для получения случайных значений из диапазона
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// функция для перетасовки массива
const shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }
  return someArray;
};

const ensureArray = (value) => Array.isArray(value) ? value : [value];

const asyncMiddleware = (fn) =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

module.exports = {
  ensureArray,
  shuffle,
  getRandomInt,
  asyncMiddleware
};
