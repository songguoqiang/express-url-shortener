if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const urlShortener = require("./routes/url_shortener");

const isProduction = process.env.NODE_ENV === "production";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbUrl = process.env.MONGODB_URL;
mongoose.connect(dbUrl, {}).then(async () => {
  console.log("Connected to mongo database at " + dbUrl);

  const Counter = require("./models/counter");

  const doc = await Counter.findById({ _id: "url_count" });
  if (!doc) {
    console.log("Initializing the counter.");
    var counter = new Counter({ _id: "url_count", count: 10000 });
    await counter.save();
    console.log("Counter initialized..");
  }
});

if (!isProduction) {
  mongoose.set("debug", true);
}

app.use("/", urlShortener);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.send("error");
});

module.exports = app;
