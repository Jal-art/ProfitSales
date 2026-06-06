const { Op } = require("sequelize");
const { Sale, GameAccount } = require("../models");

exports.getSalesReport = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereCondition = {};

    if (start_date && end_date) {
      whereCondition.sale_date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const { count, rows: sales } = await Sale.findAndCountAll({
      where: whereCondition,
      include: [{ model: GameAccount }],
      order: [["sale_date", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    const totalSales = sales.reduce((total, sale) => {
      return total + sale.sold_price;
    }, 0);

    const totalProfit = sales.reduce((total, sale) => {
      return total + sale.profit;
    }, 0);

    res.json({
      start_date: start_date || null,
      end_date: end_date || null,
      totalTransaction: count,
      totalSales,
      totalProfit,
      data: sales,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};