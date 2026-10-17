const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
          type: String,
        required: true,
    },
    waiting: {
        type: Number,
        default: 0,
    },
    estimatedTime: {
        type: Number,
        default: 0,
    },
    nextTicketNumber: {
        type: Number,
        default: 1
    },
    currentTicketNumber: {
        type: Number,
        default: null
    },
    queue: [
        {
            ticketNumber: Number,
            userId: String,
        },
    ],

});
module.exports = mongoose.model("Service", serviceSchema);