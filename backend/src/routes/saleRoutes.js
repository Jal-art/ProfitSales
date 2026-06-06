const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");
const { createSaleValidation } = require("../validations/saleValidation");

const saleController = require("../controllers/saleController");

router.get("/", authMiddleware, saleController.getAllSales);

router.post(
  "/",
  authMiddleware,
  createSaleValidation,
  validationMiddleware,
  saleController.createSale
);

router.delete("/:id/refund", authMiddleware, saleController.refundSale);

module.exports = router;