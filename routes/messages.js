const express = require('express')
const Message = require('../models/Message')
const Friendship = require('../models/Friendship')

const router = express.Router()

router.post('/', async (req, res) => {
  const { _id } = req.session.user
  const friendship = await Friendship.findById(req.body.friendshipId)
  const { user, friend } = friendship

  let message
  if (user.equals(_id) || friend.equals(_id)) {
    if (friendship.active) {
      message = new Message(req.body)
      message.from = _id
      await message.save().catch(err => message = 'Something went wrong')
    }
    else {
      message = 'This friendship is inactive'
    }
  }

  if (typeof message === 'object') {
    global.sendSSE(req => req.session.user && (user.equals(_id) || friend.equals(_id)), 'message', message)
  }

  res.json(message || `You can't write in this chat`)
})

/* router.put('/:id', async (req, res) => {
  const message = await Message.findById(req.params.id)
  let error
  if (!message.read) {
    message.date = message.date
    message.read = true
    await message.save().catch(err => error = err)
  }
  res.json(error || message)
}) */

router.put('/:friendshipId', async (req, res) => {
  const friendships = await Friendship.find()
  const friendship = friendships.find(friendship => friendship._id.equals(req.params.friendshipId))

  friendship.messages
    .reverse()
    .slice(0, friendship.unread)
    .forEach(async message => {
      const dbMessage = await Message.findById(message._id)
      dbMessage.read = true
      await dbMessage.save()
    })

  res.json('ok')
})

module.exports = router