const express = require('express')
const Friendship = require('../models/Friendship')
const User = require('../models/User')

const router = express.Router()

router.get('/', async (req, res) => {
  let error
  const friendships = await Friendship.find().catch(err => error = err)
  res.json(error || friendships)
})

router.post('/:id', async (req, res) => {
  const { _id, firstName, lastName } = req.session.user

  const friend = await User.findById(req.params.id)

  let friendship
  const friendships = await Friendship.find()
  if (
    friendships.some(friendship => friendship.user._id.equals(_id) && friendship.friend._id.equals(friend._id)) ||
    friendships.some(friendship => friendship.user._id.equals(friend._id) && friendship.friend._id.equals(_id))
  ) {
    friendship = 'This friendship already exists'
  }
  else {
    if (friend) {
      friendship = new Friendship({
        user: _id,
        friend: friend._id
      })
      await friendship.save()

      global.sendSSE(req => req.session.user && friend._id.equals(req.session.user._id), 'new-request', { firstName, lastName })
    }
  }

  res.json(friendship || 'Something went wrong')
})

router.put('/:id', async (req, res) => {
  const friendships = await Friendship.find()
  const friendship = friendships.find(friendship => friendship._id.equals(req.params.id))

  const { user, friend } = friendship
  const sseReceiver = user._id.equals(req.session.user._id) ? friend : user
  const sseSender = user._id.equals(req.session.user._id) ? user : friend

  let result
  if (req.session.user && friendship.friend._id.equals(req.session.user._id)) {
    friendship.active = true
    await friendship.save()
    result = friendship
    global.sendSSE(req => req.session.user && sseReceiver._id.equals(req.session.user._id), 'accepted-request', {
      firstName: sseSender.firstName,
      lastName: sseSender.lastName
    })
  }
  else {
    result = `You can't perform this action`
  }
  
  res.json(result)
})

router.delete('/:id', async (req, res) => {
  const friendship = await Friendship.findById(req.params.id)
  if (friendship && !friendship.active) {
    await friendship.remove()
    const { user, friend } = friendship
    global.sendSSE(req => req.session.user && (friend.equals(req.session.user._id) || user.equals(req.session.user._id)), 'delete-request', { deleted: true })
    res.json(friendship || `Couldn't find friendship`)
  }
})

module.exports = router