const { fn, col } = require("sequelize");
const { GameAccount, Sale, Expense } = require("../models");

exports.getDashboard = async (req, res) => {
  try {
    const totalAccounts = await GameAccount.count();

    const availableAccounts = await GameAccount.count({
      where: { status: "available" },
    });

    const soldAccounts = await GameAccount.count({
      where: { status: "sold" },
    });

    const reservedAccounts = await GameAccount.count({
      where: { status: "reserved" },
    });

    const problemAccounts = await GameAccount.count({
      where: { status: "problem" },
    });

    const totalModal = await GameAccount.sum("purchase_price");

    const totalSales = await Sale.sum("sold_price");

    const totalProfit = await Sale.sum("profit");

    const totalExpense = await Expense.sum("amount");

    const netProfit = (totalProfit || 0) - (totalExpense || 0);

    const latestSales = await Sale.findAll({
      include: [{ model: GameAccount }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({
      totalAccounts,
      availableAccounts,
      soldAccounts,
      reservedAccounts,
      problemAccounts,
      totalModal: totalModal || 0,
      totalSales: totalSales || 0,
      totalProfit: totalProfit || 0,
      totalExpense: totalExpense || 0,
      netProfit,
      latestSales,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stockPerGame = await GameAccount.findAll({
      attributes: [
        "game_name",
        [fn("COUNT", col("id")), "total"],
      ],
      group: ["game_name"],
    });

    const soldPerGame = await Sale.findAll({
      include: [
        {
          model: GameAccount,
          attributes: [],
        },
      ],
      attributes: [
        [col("GameAccount.game_name"), "game_name"],
        [fn("COUNT", col("Sale.id")), "total_sold"],
        [fn("SUM", col("sold_price")), "total_sales"],
        [fn("SUM", col("profit")), "total_profit"],
      ],
      group: ["GameAccount.game_name"],
    });

    res.json({
      stockPerGame,
      soldPerGame,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};