// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MongoDB Connection -----------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://zaidadil:zaidadil11@cluster0.tqsolpt.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ----------------- Schemas -----------------
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  price: Number,
});
const Cart = mongoose.model("Cart", cartSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  address: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);

// ----------------- Middleware -----------------
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ----------------- Auth Routes -----------------
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ message: "Username already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.json({ message: "Registration successful" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Login successful", token });
});

// ----------------- Cart Routes -----------------
app.get("/api/cart", authMiddleware, async (req, res) => {
  const items = await Cart.find({ userId: req.userId });
  res.json(items);
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ message: "Invalid item" });

  const newItem = new Cart({ userId: req.userId, name, price });
  await newItem.save();
  res.json({ message: "Item added", item: newItem });
});

app.delete("/api/cart/:id", authMiddleware, async (req, res) => {
  await Cart.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Item removed" });
});

app.delete("/api/cart", authMiddleware, async (req, res) => {
  await Cart.deleteMany({ userId: req.userId });
  res.json({ message: "Cart cleared" });
});

// ----------------- Order Routes -----------------
app.post("/api/order", authMiddleware, async (req, res) => {
  const { name, address, phone } = req.body;
  if (!name || !address || !phone)
    return res.status(400).json({ message: "All fields are required" });

  const order = new Order({ userId: req.userId, name, address, phone });
  await order.save();
  res.json({ message: "Order placed successfully" });
});

// ----------------- Server -----------------
app.use(express.static("frontend"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
