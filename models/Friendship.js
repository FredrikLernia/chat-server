const mongoose = require('mongoose')
const Schema = mongoose.Schema

const toJSONSettings = {
  virtuals: true,
  transform: function (doc, ret) {
    if (ret.messages) {
      ret.messages.forEach(message => delete message.friendshipId)
    }
    delete ret.id
    return ret
  }
}

const modelName = 'Friendship'

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'UserRaw', required: true },
  friend: { type: Schema.Types.ObjectId, ref: 'UserRaw', required: true },
  active: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, {
  toJSON: toJSONSettings,
  toObject: toJSONSettings
})

schema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'friendshipId'
})

schema.pre('find', function () {
  this.populate('messages')
})

schema.pre('find', function () {
  this.populate('user friend', 'username firstName lastName colorTheme online')
})

module.exports = mongoose.model(modelName, schema)