const mongoose = require("mongoose");
const ticketHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    serviceName: {
        type: String,
        required: true,
    },
    ticketNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Waiting", "Served", "Cancelled"],
        default: "Waiting",
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
        default: null,
    },
});
module.exports = mongoose.model("TicketHistory", ticketHistorySchema);