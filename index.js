const express = require('express')
require('dotenv').config()
const identifyRoute = require('./Routes/identifyRoute.routes')
const mongoose = require('mongoose')

const DB_URI = process.env.DB_URI
mongoose
  .connect(`${DB_URI}`)
  .then(() => {
    console.log('Connected to Db at ', DB_URI);
  })
  .catch((e) => console.log('Failed to connect to DB', e));

  const app = express()
  app.use(express.json())
  
  app.use('/', identifyRoute)
  
  app.listen(process.env.SERVER_PORT, () => {
    console.log('Server listening at PORT: ', process.env.SERVER_PORT)
  })
  
