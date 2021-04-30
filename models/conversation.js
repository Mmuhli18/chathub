const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    messages: []
})

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;