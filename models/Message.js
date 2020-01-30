const mongoose = require('mongoose')
const Schema = mongoose.Schema

const modelName = 'Message'

const schema = new Schema({
  friendshipId: { type: Schema.Types.ObjectId, required: true },
  from: { type: Schema.Types.ObjectId, required: true },
  date: { type: Date, default: Date.now },
  text: { type: String, required: true },
  read: { type: Boolean, default: false }
})

module.exports = mongoose.model(modelName, schema)