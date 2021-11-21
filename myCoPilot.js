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
  origin: 'https://afr-auto-fill.herokuapp.com/list',
  // origin: 'http://localhost:3000/list',
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
    // get a doc by ticketId or remedy
    const query = req.query.id
    const doc = Ticket.findOne({$or: [{ticketId: query}, {remedy: query}]}).lean().exec()
    doc.then((doc) => {
      if(!doc) {
        res.send({message: 'no data found'})
      } else {
        res.send(doc)
      }
      
    })
  } else if(req.query.regtsel) {
    // filter docs by regtsel[num]
    const query = req.query.regtsel
    const regex = new RegExp(`regtsel${query}(?![0-1])`, 'i')
    const docs = Ticket.find({ticketHL: regex}).lean().exec()
    docs.then((docs) => {
      if(docs.length === 0) {
        res.send({message: 'no data found'})
      } else if(docs) {
        res.send(docs)
      }
    })
  } else if(req.query.date) {
    // filter docs by date
    const dateRegex = new RegExp(req.query.date, 'i')
    const datePatt = /\d{2}-\d{2}-\d{4}/
    const validDate = datePatt.test(req.query.date)
    if(!validDate) {
      res.send({message: 'invalid date'})
    } else if(validDate) {
      const docs = Ticket.find({dateOpen: dateRegex}).lean().exec()
      docs.then((docs) => {
        if(docs.length === 0) {
          res.send({message: 'no data found'})
        } else {
          res.send(docs)
        }
      })
    }
  }
  else {
    // get all docs
    const docs = Ticket.find({}).lean().exec()
    docs.then((docs) => {
      res.send(docs)
    })
  }
})

app.get('/list/:hl', (req, res) => {
  const regtsel = req.query.regtsel
  const date = req.query.date
  const typeRegex = new RegExp(req.params.hl, 'i')
  const typeAndRegtselRegex = new RegExp(`(?=.*${req.params.hl})(?=.*regtsel${regtsel}(?![0-1]))`, 'i')
  if(!regtsel && !date) {
    // if no query which is regtsel[num]
    const docs = Ticket.find({ticketHL: typeRegex}).lean().exec()
    docs.then((docs) => {
      if(docs.length === 0) {
        res.send({message: 'no data found'})
      } else if(docs) {
        res.send(docs)
      }
    })
  } else if(regtsel) {
    // with query and params
    const docs = Ticket.find({ticketHL: typeAndRegtselRegex}).lean().exec()
    docs.then((docs) => {
      if(docs.length === 0) {
        res.send({message: 'no data found'})
      } else if(docs) {
        res.send(docs)
      }
    })
  } else if(date) {
    // filter docs by type and date open
    const dateRegex = new RegExp(req.query.date, 'i')
    const datePatt = /\d{2}-\d{2}-\d{4}/
    const validDate = datePatt.test(date)
    if(!validDate) {
      res.send({message: 'invalid date'})
    } else if(validDate) {
      const docs = Ticket.find({$and: [{ticketHL: typeRegex}, {dateOpen: dateRegex}]}).lean().exec()
      docs.then((docs) => {
        if(docs.length === 0) {
          res.send({message: 'no data found'})
        } else {
          res.send(docs)
        }
      })
    }
  }
})

app.put('/list', cors(corsOptions), (req, res) => {
  const filter = {
    ticketId: req.body.ticketId
  }
  const update = {
    actualSolution: req.body.actualSolution,
    incidentDomain: req.body.incidentDomain,
    RFO_details: req.body.RFO_details,
    dateClosed: req.body.dateClosed
  }
  const doc = Ticket.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true
  }).lean().exec()
  doc.then((doc) => {
    if(doc) {
      res.send(doc)
    }   
  })  
})

// input new ticket
app.post('/addlist', (req, res) => {
  // adds new ticket
  Ticket.findOne({ticketId: req.body.ticketId}).exec((err, doc) => {
    if(err) {
      res.send(err)
    } else if(doc) {
      // if there is a match, replace entire doc with new doc
      const filter = {
        ticketId: req.body.ticketId
      }
      const doc = {
        ticketId: req.body.ticketId,
        ticketHL: req.body.ticketHL,
        dateOpen: req.body.dateOpen,
        remedy: req.body.remedy,
        impact: req.body.impact,
        datek: req.body.datek
      }
      const options = {
        returnDocument: 'after',
        lean: true
      }
      Ticket.findOneAndReplace(filter, doc, options, (error, doc) => {
        if(error) {
          res.send(err)
        } else {
          res.send({message: `updated this ${doc.ticketId}`})
        }
      })
    } else {
      // if there is no match, create one
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
          res.send(err.errors)       
        } else {
          data.save()
          res.send({message: 'success'})
        }      
      })      
    }
  })
})

app.listen(port)


