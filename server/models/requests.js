// MongoDB Information
const mongoose = require('mongoose')

// MongoDB Schema and Model
const requestSchema = new mongoose.Schema({
  method: String,
  path: String,
  url: String,
  headers: String,
  query: String,
  body: String
})

requestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Request', requestSchema)