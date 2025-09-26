const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ msg: "Username already exists" });

        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPass });
        await newUser.save();
        res.json({ msg: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, "secret123", { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
