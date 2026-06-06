const { Sale, GameAccount } = require("../models");

exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Sale.findAndCountAll({
      include: [{ model: GameAccount }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const {
      game_account_id,
      buyer_name,
      sold_price,
      payment_method,
      sale_date,
    } = req.body;

    const account = await GameAccount.findByPk(game_account_id);

    if (!account) {
      return res.status(404).json({
        message: "Akun game tidak ditemukan",
      });
    }

    if (account.status === "sold") {
      return res.status(400).json({
        message: "Akun ini sudah terjual",
      });
    }

    const profit = sold_price - account.purchase_price;

    const lastSale = await Sale.findOne({
      order: [["id", "DESC"]],
    });

    let transactionNumber = 1;

    if (lastSale) {
      transactionNumber = lastSale.id + 1;
    }

    const transaction_no = `TRX-${String(transactionNumber).padStart(4, "0")}`;

    const sale = await Sale.create({
      transaction_no,
      game_account_id,
      buyer_name,
      sold_price,
      profit,
      payment_method,
      sale_date,
    });

    await account.update({
      selling_price: sold_price,
      status: "sold",
    });

    res.status(201).json({
      message: "Penjualan berhasil dicatat",
      transaction_no,
      sale,
      profit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refundSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);

    if (!sale) {
      return res.status(404).json({
        message: "Data penjualan tidak ditemukan",
      });
    }

    const account = await GameAccount.findByPk(sale.game_account_id);

    if (!account) {
      return res.status(404).json({
        message: "Akun game tidak ditemukan",
      });
    }

    await account.update({
      status: "available",
      selling_price: null,
    });

    await sale.destroy();

    res.json({
      message: "Refund berhasil, status akun kembali available",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};