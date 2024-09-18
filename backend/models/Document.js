const { Schema, model } = require("mongoose")

const Document = new Schema({
  _id: String,
  data: Object,
  code: String
})

module.exports = model("Document", Document)