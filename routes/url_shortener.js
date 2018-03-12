const atob = require("atob");
const btoa = require("btoa");
const express = require("express");
const router = express.Router();

let urlCounter = 1000;
const idToUrl = new Map();
const urlToId = new Map();

function getNextUrlID() {
  return urlCounter++;
}

function isUrlRegistered(url) {
  return urlToId.has(url);
}

function registerLongUrl(url) {
  if (isUrlRegistered(url)) {
    throw new Error(`The long URL ${url} is already registered`);
  }
  const id = getNextUrlID();
  idToUrl.set(id, url);
  urlToId.set(url, id);
}

function removeLongUrl(url) {
  if (isUrlRegistered(url)) {
    const id = urlToId.get(url);
    urlToId.delete(url);
    idToUrl.delete(id);
  }
}

function getShortUrl(url) {
  if (!isUrlRegistered(url)) {
    throw new Error(`The long URL ${url} is not yet registered`);
  }
  const id = urlToId.get(url);
  return btoa(id);
}

function decodeUrlHash(hash) {
  return atob(hash);
}

function isValidUrlId(id) {
  return idToUrl.has(id);
}

function findLongUrl(id) {
  return idToUrl.get(id);
}

function missingHashError(res) {
  return res
    .status(400)
    .send({ message: "missing `hash` in request query parameter" });
}

function getIdFromHash(hash) {
  return parseInt(decodeUrlHash(hash));
}

router.post("/shorten-url", function(req, res, next) {
  const longUrl = req.body.url;

  if (!longUrl) {
    return res.status(400).send({ message: "missing `url` in request body" });
  }

  if (isUrlRegistered(longUrl)) {
    const shortUrl = getShortUrl(longUrl);
    return res.status(200).send({ hash: shortUrl });
  }

  registerLongUrl(longUrl);
  const shortUrl = getShortUrl(longUrl);
  return res.status(201).send({ hash: shortUrl });
});

router.get("/expand-url", function(req, res, next) {
  const hash = req.query.hash;

  if (!hash) {
    return missingHashError(res);
  }

  const urlId = getIdFromHash(hash);

  if (isValidUrlId(urlId)) {
    const longUrl = findLongUrl(urlId);
    return res.status(200).send({ url: longUrl });
  } else {
    return res
      .status(404)
      .send({ message: `There is no URL registered for hash value ${hash}` });
  }
});

router.delete("/expand-url", function(req, res, next) {
  const hash = req.query.hash;

  if (!hash) {
    return missingHashError(res);
  }

  const urlId = getIdFromHash(hash);

  if (isValidUrlId(urlId)) {
    removeLongUrl(findLongUrl(urlId));
    return res.status(200).send({
      message: `URL with hash value '${hash}' deleted successfully`
    });
  } else {
    return res
      .status(404)
      .send({ message: `There is no URL registered for hash value ${hash}` });
  }
});

module.exports = router;
