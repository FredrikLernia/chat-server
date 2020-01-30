const express = require('express')
const router = express.Router()

const User = require('../models/User')

router.get('/', async (req, res) => {
  if (req.session.user) {
    const users = await User.find()
    const user = users.find(user => user._id.equals(req.session.user._id))
    req.session.user = user
  }

  res.json(req.session.user || 'not logged in')
})

router.post('/', async (req, res) => {
  const { username, password } = req.body
  const users = await User.find()
  const user = users.find(user => user.username === username && user.password === password)

  if (user) {
    user.online = true
    await user.save()
    req.session.user = user
    req.session.page = {
      tab: 'chats',
      friendView: 'list',
      friendship: null
    }
  }

  res.json(user || 'Wrong username or password')
})

router.delete('/', async (req, res) => {
  if (req.session.user) {
    const user = await User.findById(req.session.user._id)
    user.online = false
    await user.save()
    delete req.session.user
    delete req.session.page
  }
  res.json('logged out')
})

module.exports = router