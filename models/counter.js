const mongoose = require("mongoose");

const countersSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  count: { type: Number, default: 0 }
});

const Counter = mongoose.model("Counter", countersSchema);

module.exports = Counter;
