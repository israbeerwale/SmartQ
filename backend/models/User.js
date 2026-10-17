const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["customer", "staff"],
        default: "customer",
    },
    queueHistory: [
        {
            serviceName: String,
            ticketNumber: Number,
            status: {
                type: String,
                enum: ["Completed",
                    "Cancelled"
                ],
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});
module.exports = mongoose.model("User", userSchema);