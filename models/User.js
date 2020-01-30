const mongoose = require('mongoose')
const Schema = mongoose.Schema

const toJSONSettings = {
  virtuals: true,
  transform: function (doc, ret) {
    const friendships = []
    ret.friendships.forEach(friendship => {
      if (ret._id.equals(friendship.user._id)) {
        delete friendship.user
      }
      else {
        friendship.friend = friendship.user
        delete friendship.user
      }
      if (friendship.active) {
        friendships.push(friendship)
      }
    })

    ret.friendships = friendships

    const received = []
    const sent = []
    if (ret.friendRequests) {
      ret.friendRequests.received.forEach(request => {
        if (request.active) {
          return
        }
        request.friend = request.user
        delete request.user
        delete request.friend.online
        delete request.messages
        delete request.date
        received.push(request)
      })
      ret.friendRequests.received = received

      ret.friendRequests.sent.forEach(request => {
        if (request.active) {
          return
        }
        delete request.user
        delete request.friend.online
        delete request.messages
        delete request.date
        sent.push(request)
      })
      ret.friendRequests.sent = sent
    }

    delete ret.friendshipWhenUser
    delete ret.friendshipWhenFriend
    delete ret.id
    return ret
  }
}

const modelName = 'User'

const schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  colorTheme: { type: String, default: 'blue' },
  online: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, {
  toJSON: toJSONSettings,
  toObject: toJSONSettings
})

schema.virtual('friendshipWhenUser', {
  ref: 'Friendship',
  localField: '_id',
  foreignField: 'user'
})

schema.pre('find', function () {
  this.populate('friendshipWhenUser')
})

schema.virtual('friendshipWhenFriend', {
  ref: 'Friendship',
  localField: '_id',
  foreignField: 'friend'
})

schema.pre('find', function () {
  this.populate('friendshipWhenFriend')
})

schema.virtual('friendships').get(function () {
  return (this.friendshipWhenUser || []).concat((this.friendshipWhenFriend || []))
})

schema.virtual('friendRequests').get(function () {
  return {
    received: this.friendshipWhenFriend,
    sent: this.friendshipWhenUser
  }
})

module.exports = mongoose.model(modelName, schema)