const mongoose = require('mongoose')
const Schema = mongoose.Schema

const modelName = 'UserRaw'

const schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  colorTheme: { type: String, default: 'blue' },
  online: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model(modelName, schema, 'users')