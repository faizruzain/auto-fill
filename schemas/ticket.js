const mongoose = require('mongoose')

// define Schema
const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true
  },
  ticketHL: {
    type: String,
    required: true,
    validate: {
      validator: ((hl) => {
        return /TSEL_/.test(hl)
      }),
      message: 'not a valid headline'
    }
  },
  dateOpen: {
    type: String,
    required: true
  },
  remedy: {
    type: String,
    required: true
  },
  siteId: String,
  impact: {
    type: [String],
    // validate: {
    //   validator: ((impact => {
    //     return impact.length > 0
    //   })),
    //   message: 'cannot be empty'
    // }
  },
  datek: {
    type: [String]
  }
}, {
  collection: 'tickets'
})

// your methods must be here before compiling

// compiling Schema to Model
const Ticket = mongoose.model('Ticket', ticketSchema)
module.exports = Ticket