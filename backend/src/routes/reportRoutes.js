const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const reportController = require("../controllers/reportController");

router.get("/sales", authMiddleware, reportController.getSalesReport);

module.exports = router;