const mongoose = require("mongoose");
const Counter = require("./counter")

const urlSchema = new mongoose.Schema({
  _id: {type: Number},
  url: '',
  created_at: ''
});

urlSchema.pre('save', async function(next) {
  const doc = this;
  const counter = await Counter.findByIdAndUpdate({ _id: 'url_count' }, { $inc: { count: 1 } });
  doc._id = counter.count;
  doc.created_at = new Date();
  next();
});

const URL = mongoose.model('URL', urlSchema);

module.exports = URL;