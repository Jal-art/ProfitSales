const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define("Sale", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    transaction_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    game_account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    buyer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sold_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    profit: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM("direct", "rekber", "cod"),
        allowNull: false,
    },
    sale_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

module.exports = Sale;