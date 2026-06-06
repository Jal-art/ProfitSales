const { body } = require("express-validator");

exports.createAccountValidation = [
  body("game_name")
    .notEmpty()
    .withMessage("Nama game wajib diisi"),

  body("account_name")
    .notEmpty()
    .withMessage("Nama akun wajib diisi"),

  body("purchase_price")
    .notEmpty()
    .withMessage("Harga beli wajib diisi")
    .isInt({ min: 0 })
    .withMessage("Harga beli harus berupa angka"),

  body("selling_price")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Harga jual harus berupa angka"),

  body("status")
    .optional()
    .isIn(["available", "sold", "reserved", "problem"])
    .withMessage("Status tidak valid"),
];