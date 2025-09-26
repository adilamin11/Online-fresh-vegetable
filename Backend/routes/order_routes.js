const express = require("express");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");
const router = express.Router();

function auth(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    jwt.verify(token, "secret123", (err, decoded) => {
        if (err) return res.status(401).json({ msg: "Invalid token" });
        req.userId = decoded.id;
        next();
    });
}

router.post("/", auth, async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        const newOrder = new Order({ name, address, phone, userId: req.userId });
        await newOrder.save();
        res.json({ msg: "Order placed successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
