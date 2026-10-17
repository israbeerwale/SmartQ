const mongoose = require("mongoose");
require("dotenv").config();
const Service = require("./models/Service");
const services = [
  {
    name: "General Consultation",
    description: "Consult a doctor without waiting in a physical line.",
    waiting: 8,
    estimatedTime: 24,
  },
  {
    name: "Hair Salon",
    description: "Join the queue for your haircut or salon service.",
    waiting: 5,
    estimatedTime: 15,
  },
  {
    name: "Bank Services",
    description: "Get your banking service token digitally.",
    waiting: 12,
    estimatedTime: 36,
  },
  {
    name: "Student Help Desk",
    description: "Join the queue for college administartive services.",
    waiting: 3,
    estimatedTime: 9,
  },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await Service.deleteMany();
    await Service.insertMany(services);
    console.log("Services added to MongoDB");
    await mongoose.connection.close();
})
.catch((error) => {
    console.log("Error:", error.message);
});
