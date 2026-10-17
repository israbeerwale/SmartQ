const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
router.post("/register", async (req,res) => {
    try {
        const { email, password } = req.body;
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({
            message: "User registered successfully",
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Registartion failed",
        });
    }
});
router.post("/login", async (req, res) => {
    try{
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );
        if(!isPasswordCorrect){
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                role: user.role ,
            },
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Login failed",
        });
    }
});
router.get("/history/:userId", async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if(!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.json(user.queueHistory || []);
    }catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch queue history",
        });
    }
});
module.exports = router;