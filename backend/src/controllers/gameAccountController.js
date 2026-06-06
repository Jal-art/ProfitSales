const { Op } = require("sequelize");
const { GameAccount } = require("../models");

exports.getAllAccounts = async (req, res) => {
  try {
    const { search, game_name, status, page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereCondition = {};

    if (search) {
      whereCondition.account_name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (game_name) {
      whereCondition.game_name = game_name;
    }

    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await GameAccount.findAndCountAll({
      where: whereCondition,
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

exports.getAccountById = async (req, res) => {
  try {
    const account = await GameAccount.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const {
      game_name,
      account_name,
      login_email,
      login_password,
      purchase_price,
      selling_price,
      status,
      note,
    } = req.body;

    const account = await GameAccount.create({
      game_name,
      account_name,
      login_email,
      login_password,
      purchase_price,
      selling_price,
      status,
      note,
    });

    res.status(201).json({
      message: "Akun game berhasil ditambahkan",
      account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await GameAccount.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    await account.update(req.body);

    res.json({
      message: "Akun game berhasil diupdate",
      account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await GameAccount.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    await account.destroy();

    res.json({ message: "Akun game berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};