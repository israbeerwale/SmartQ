const express = require("express");
const Service = require("../models/Service");
const User = require("../models/User");
const router = express.Router();
const { getIO } = require("../socket");
const TicketHistory = require("../models/TicketHistory");
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
    });
  }
});
router.get("/active-ticket/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const activeTicket = await TicketHistory.findOne({
      userId: String(userId),
      status: "Waiting",
    }).sort({ joinedAt: -1 });

    if (!activeTicket) {
      return res.status(404).json({
        message: "No active ticket found",
      });
    }

    res.json(activeTicket);
  } catch (error) {
    console.error("Error fetching active ticket:", error);
    res.status(500).json({
      message: "Failed to fetch active ticket",
    });
  }
});
router.get("/history/:userId", async(req, res) => {
  try{
    const { userId } = req.params;
    const history = await TicketHistory.find({
      userId: String(userId),
    }).sort({ joinedAt: -1 });
    res.status(200).json({
      history: history,
    });
  } catch (error) {
    console.error("Error fetching ticket history:", error);
    res.status(500).json({
      message: "Could not fetch ticket history",
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service",
    });
  }
});
router.post("/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    // Prevent a user from joining if they already have
    // an active ticket in any service.
    //console.log("JOIN REQUEST USER ID:" , String(userId));
    const existingTicket = await TicketHistory.findOne({
      userId: String(userId),
      status: "Waiting",
    });
    //console.log("Existing waiting ticket:",existingTicket);
    if (existingTicket) {
      return res.status(409).json({
        message: "You already have an active ticket. Complete or cancel it before joining another queue.",
      });
    }

    const ticketNumber = Math.max(
      service.nextTicketNumber,
      (service.currentTicketNumber || 0) + 1
    );

    service.nextTicketNumber = ticketNumber + 1;
    service.waiting += 1;
    service.estimatedTime += 3;

    service.queue.push({
      ticketNumber,
      userId,
    });

    await service.save();

    await TicketHistory.create({
      userId: String(userId),
      serviceId: service._id,
      serviceName: service.name,
      ticketNumber,
      status: "Waiting",
    });

    const io = getIO();

    if (io) {
      io.emit("queueUpdated", service);
    }

    res.json({
      ...service.toObject(),
      ticketNumber,
    });
  } catch (error) {
    console.error("Error joining queue:", error);

    res.status(500).json({
      message: "Failed to join queue",
    });
  }
});
router.post("/:id/cancel", async (req, res) => {
  try {
    const { userId } = req.body;

    const service = await Service.findById(req.params.id);
    const user = await User.findById(userId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const customerIndex = service.queue.findIndex(
      (customer) => String(customer.userId) === String(userId),
    );

    if (customerIndex === -1) {
      return res.status(400).json({
        message: "Customer not found in queue",
      });
    }
    const CancelledTicket = service.queue[customerIndex];

    service.queue.splice(customerIndex, 1);
    await TicketHistory.findOneAndUpdate(
      {
        userId: String(userId),
        serviceId: service._id,
        ticketNumber:
        CancelledTicket.ticketNumber,
        status: "Waiting",
      },
      {
        status: "Cancelled",
        completedAt: new Date(),
      },
    );

    service.waiting = Math.max(service.waiting - 1, 0);

    if (service.estimatedTime >= 3) {
      service.estimatedTime -= 3;
    }
    if (user) {
      user.queueHistory.push({
        serviceName: service.name,
        ticketNumber: CancelledTicket.ticketNumber,
        status: "Cancelled",
      });
      await user.save();
    }

    await service.save();
    const io = getIO();
    if(io){
      io.emit("queueUpdated", service);
      io.emit("ticketHistoryUpdated", {
        userId: String(userId),
        serviceid: String(service._id),
        ticketNumber:
        CancelledTicket.ticketNumber,
        status: "Cancelled",
      });
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to cancel queue",
    });
  }
});
router.post("/:id/serve", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    // Ensure the queue actually contains a customer
    if (!service.queue || service.queue.length === 0) {
      service.waiting = 0;
      service.estimatedTime = 0;
      await service.save();

      return res.status(400).json({
        message: "No customers waiting",
      });
    }

    const servedCustomer = service.queue.shift();

    service.currentTicketNumber = servedCustomer.ticketNumber;
    service.waiting = service.queue.length;
    service.estimatedTime = service.waiting * 3;

    await TicketHistory.findOneAndUpdate(
      {
        userId: String(servedCustomer.userId),
        serviceId: service._id,
        ticketNumber: servedCustomer.ticketNumber,
        status: "Waiting",
      },
      {
        status: "Served",
        completedAt: new Date(),
      }
    );

    const user = await User.findById(servedCustomer.userId);

    if (user) {
      user.queueHistory.push({
        serviceName: service.name,
        ticketNumber: servedCustomer.ticketNumber,
        status: "Completed",
      });

      await user.save();
    }

    await service.save();

    const io = getIO();

    if (io) {
      io.emit("queueUpdated", service);

      io.emit("ticketHistoryUpdated", {
        userId: String(servedCustomer.userId),
        serviceId: String(service._id),
        ticketNumber: servedCustomer.ticketNumber,
        status: "Served",
      });
    }

    res.json(service);
  } catch (error) {
    console.error("Error serving customer:", error);

    res.status(500).json({
      message: "Failed to serve customer",
    });
  }
});

module.exports = router;
