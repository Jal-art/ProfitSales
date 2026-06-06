const { body } = require("express-validator");

exports.createSaleValidation = [
  body("game_account_id")
    .notEmpty()
    .withMessage("ID akun game wajib diisi")
    .bail()
    .isInt()
    .withMessage("ID akun game harus angka"),

  body("buyer_name")
    .notEmpty()
    .withMessage("Nama pembeli wajib diisi"),

  body("sold_price")
    .notEmpty()
    .withMessage("Harga jual wajib diisi")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Harga jual harus berupa angka"),

  body("payment_method")
    .notEmpty()
    .withMessage("Metode pembayaran wajib diisi")
    .bail()
    .isIn(["direct", "rekber", "cod"])
    .withMessage("Metode pembayaran tidak valid"),

  body("sale_date")
    .notEmpty()
    .withMessage("Tanggal penjualan wajib diisi")
    .bail()
    .isDate()
    .withMessage("Format tanggal tidak valid"),
];