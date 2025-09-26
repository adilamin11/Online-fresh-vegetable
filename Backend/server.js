const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://zaidadil:zaidadil11@cluster0.tqsolpt.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const orderRoutes = require("./routes/order_routes");
app.use("/api/order", orderRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
