const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json(req.session.page)
})

router.put('/', (req, res) => {
  req.session.page = req.body
  res.json(req.body)
})

module.exports = router