const User = require("./User");
const GameAccount = require("./GameAccount");
const Sale = require("./Sale");
const Expense = require("./Expense");

GameAccount.hasOne(Sale, {
  foreignKey: "game_account_id",
});

Sale.belongsTo(GameAccount, {
  foreignKey: "game_account_id",
});

module.exports = {
  User,
  GameAccount,
  Sale,
  Expense,
};