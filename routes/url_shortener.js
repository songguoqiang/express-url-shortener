const atob = require("atob");
const btoa = require("btoa");
const express = require("express");
const router = express.Router();
const URL = require("../models/url");

function missingHashError(res) {
  return res
    .status(400)
    .send({ message: "missing `hash` in request query parameter" });
}

function decodeUrlHash(hash) {
  return atob(hash);
}

function getIdFromHash(hash) {
  return parseInt(decodeUrlHash(hash));
}

// TODO: handle the possible rejected promise from the async function
router.post("/shorten-url", async function(req, res, next) {
  const longUrl = req.body.url;

  if (!longUrl) {
    return res.status(400).send({ message: "missing `url` in request body" });
  }

  const doc = await URL.findOne({ url: longUrl });
  if (doc) {
    console.log(`URL ${longUrl} found in DB`);
    return res.status(200).send({
      hash: btoa(doc._id)
    });
  } else {
    console.log(`URL ${longUrl} found in DB. Creating new document.`);
    const url = new URL({
      url: longUrl
    });
    await url.save();
    return res.status(201).send({
      hash: btoa(url._id)
    });
  }
});

router.get("/expand-url", async function(req, res, next) {
  const hash = req.query.hash;

  if (!hash) {
    return missingHashError(res);
  }

  const urlId = getIdFromHash(hash);

  const doc = await URL.findOne({ _id: urlId });
  if (doc) {
    return res.status(200).send({ url: doc.url });
  } else {
    return res
      .status(404)
      .send({ message: `There is no URL registered for hash value ${hash}` });
  }
});

router.delete("/expand-url", async function(req, res, next) {
  const hash = req.query.hash;

  if (!hash) {
    return missingHashError(res);
  }

  const urlId = getIdFromHash(hash);

  const doc = await URL.findOne({ _id: urlId });
  if (doc) {
    await doc.remove();
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
