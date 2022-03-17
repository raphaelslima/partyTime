const mongoose = require('mongoose')

const partySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  partyDate: {
    type: Date
  },
  photos: {
    type: Array
  },
  privacy: {
    type: Boolean
  },
  userId: mongoose.ObjectId
})

const Party = new mongoose.model('Party', partySchema)

module.exports = Party
