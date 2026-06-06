const { Expense } = require("../models");

exports.getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Expense.findAndCountAll({
      order: [["expense_date", "DESC"]],
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

exports.createExpense = async (req, res) => {
  try {
    const { name, amount, expense_date, note } = req.body;

    const expense = await Expense.create({
      name,
      amount,
      expense_date,
      note,
    });

    res.status(201).json({
      message: "Pengeluaran berhasil ditambahkan",
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Pengeluaran tidak ditemukan",
      });
    }

    await expense.update(req.body);

    res.json({
      message: "Pengeluaran berhasil diupdate",
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Pengeluaran tidak ditemukan",
      });
    }

    await expense.destroy();

    res.json({
      message: "Pengeluaran berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};