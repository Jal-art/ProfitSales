const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameAccount = sequelize.define("GameAccount", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_name: {
        type: DataTypes.ENUM(
            "Mobile Legends",
            "Free Fire",
            "Roblox",
            "Other"
        ),
        allowNull: false,
    },
    account_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    login_email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    login_password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    purchase_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    selling_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("available", "sold", "reserved", "problem"),
        defaultValue: "available",
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = GameAccount;