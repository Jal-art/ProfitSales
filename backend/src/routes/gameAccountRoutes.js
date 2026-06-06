const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");
const {
  createAccountValidation,
} = require("../validations/gameAccountValidation");

const gameAccountController = require("../controllers/gameAccountController");

router.get("/", authMiddleware, gameAccountController.getAllAccounts);
router.get("/:id", authMiddleware, gameAccountController.getAccountById);

router.post(
  "/",
  authMiddleware,
  createAccountValidation,
  validationMiddleware,
  gameAccountController.createAccount
);

router.put("/:id", authMiddleware, gameAccountController.updateAccount);
router.delete("/:id", authMiddleware, gameAccountController.deleteAccount);

module.exports = router;