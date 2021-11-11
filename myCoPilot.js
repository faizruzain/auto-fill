// ======================================= dotenv for security =======================================
require('dotenv').config()
// import dotenv from 'dotenv'
// dotenv.config()
// ======================================= dotenv for security =======================================

// =================================== express server configuration ===================================
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
// to catch incoming POST data
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

const corsOptions = {
  origin: 'http://localhost:3000/addlist',
  methods: 'PUT',
  allowedHeaders: {
    'Content-Type': 'application/json'
  }
}
// =================================== express server configuration ===================================

// ======================================== db configuration ========================================
// my schemas
const Ticket =  require('./schemas/ticket.js')
// my schemas

const mongoose = require('mongoose')
// const db = 'mongodb://localhost:27017/nossa'
const db = process.env.DB
main().catch(err => console.log(err))

async function main() {
  await mongoose.connect(db)
}
// ======================================== db configuration ========================================

// home route
app.get('/', (req, res) => {
  res.send({message: `hello ${req.ip}`})
})

app.get('/list', (req, res) => {
  if(req.query.id) {
    // get a doc
    const query = req.query.id
    const doc = Ticket.findOne({$or: [{ticketId: query}, {remedy: query}]}).lean().exec()
    doc.then((doc) => {
      if(!doc) {
        res.send({message: 'no data found'})
      } else {
        res.send(doc)
      }
      
    })
  } else {
    // get all docs
    const docs = Ticket.find({}).lean().exec()
    docs.then((docs) => {
      res.send(docs)
    })
  }
})

app.get('/list/:hl', (req, res) => {
  const regex = new RegExp(req.params.hl, 'i')
  const docs = Ticket.find({ticketHL: regex}).lean().exec()
  docs.then((docs) => {
    if(docs.length === 0) {
      res.send({message: 'no data found'})
    } else if(docs) {
      res.send(docs)
    }
  })
})

app.put('/list', cors(corsOptions), (req, res) => {
  console.log(req.body)
  console.log(req.body.siteId)
  const siteId =  req.body.siteId.match(/[A-z]{3}\d{3}/)
  console.log(siteId)
  const datek = req.body.datek
  console.log(datek)
  Ticket.findOneAndUpdate(
    {
      ticketHL: {$regex: siteId}
    },
    {
      $set: {datek: datek}
    },
    {
      rawResult: true
    }).lean().exec((err, doc) => {
      if(err) {
       res.send(err)
    } else {
      console.log(doc)
      res.send(doc)
    }
  })
})

// input new ticket
app.post('/addlist', (req, res) => {
  console.log(req.body)
  Ticket.findOne({ticketId: req.body.ticketId}).exec((err, doc) => {
    if(err) {
      res.send(err)
    } else if(doc) {
      console.log(doc)
      console.log('data exist');
      res.send({message: 'data exist'})
    } else {
      const data = new Ticket({
        ticketId: req.body.ticketId,
        ticketHL: req.body.ticketHL,
        dateOpen: req.body.dateOpen,
        remedy: req.body.remedy,
        impact: req.body.impact,
        datek: req.body.datek
      })
      data.set('validateBeforeSave', false)
      data.validate((err) => {
        if(err) {
          console.log(err.errors)
          res.send(err.errors)       
        } else {
          data.save()
          console.log(data)
          console.log('saved')
          res.send({message: 'success'})
        }      
      })      
    }
  })
})

app.listen(port)


