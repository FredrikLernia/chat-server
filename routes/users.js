const express = require('express')
const User = require('../models/User')

const router = express.Router()

router.get('/', async (req, res) => {
  if (!req.query.search) {
    const users = await User.find()
      .select('username firstName lastName colorTheme online friendships').exec()
    res.json(users)
    return
  }

  const val = req.query.search.toLowerCase().replace(/\s/g, '')

  let users = await User.find()
    .select('username firstName lastName colorTheme').exec()

  users = users.filter(({ username, firstName, lastName }) => {
    return username.toLowerCase().startsWith(val) ||
      (firstName.toLowerCase() + lastName.toLowerCase()).startsWith(val) ||
      (lastName.toLowerCase() + firstName.toLowerCase()).startsWith(val)
  })

  res.json(users)
})

router.post('/', async (req, res) => {
  const user = new User(req.body)
  let error
  let result = await user.save().catch(err => error = err)

  res.json(error || result)
})

router.put('/', async (req, res) => {
  const users = await User.find()
  const user = users.find(user => user._id.equals(req.session.user._id))

  let error
  if ('newPassword' in req.body) {
    if (user.password === req.body.currentPassword) {
      Object.assign(user, { password: req.body.newPassword })
    }
    else {
      error = `Wrong current password`
    }
  }
  else {
    Object.assign(user, req.body)
  }

  await user.save().catch(err => error = err)
  if (!error) {
    req.session.user = user
  }
  res.json(error || user)
})

module.exports = router