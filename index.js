const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const connectMongo = require('connect-mongo')(session)
const settings = require('./config/settings.json')
const sse = require('easy-server-sent-events')
require('./models/UserRaw')

const users = require('./routes/users')
const friendships = require('./routes/friendships')
const messages = require('./routes/messages')
const login = require('./routes/login')
const page = require('./routes/page')

const app = express()

mongoose.connect('mongodb://localhost:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.use(express.json())
app.use(session({
  secret: settings.salt,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // true on https server
  store: new connectMongo({mongooseConnection: mongoose.connection})
}))

const options = {
  endpoint: '/api/sse',
  script: '/sse.js'
}

const {SSE, send, openSessions, openConnections} = sse(options)
app.use(SSE)
global.sendSSE = send

app.use('/api/users', users)
app.use('/api/friendships', friendships)
app.use('/api/messages', messages)
app.use('/api/login', login)
app.use('/api/page', page)

app.listen(5000, () => console.log('Listening on port 5000'))