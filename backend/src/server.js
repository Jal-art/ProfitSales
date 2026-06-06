const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
require("./models");

const authRoutes = require("./routes/authRoutes");
const gameAccountRoutes = require("./routes/gameAccountRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const adminSeeder = require("./seeders/adminSeeder");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/accounts", gameAccountRoutes);
app.use("/api/sales", saleRoutes);  
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/expenses", expenseRoutes);


app.get("/", (req, res) => {
  res.json({ message: "API pencatatan akun game berjalan" });
});

const PORT = process.env.PORT || 5000;


sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Database connected & synced");

    await adminSeeder();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database error:", err);
  });