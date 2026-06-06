const bcrypt = require("bcryptjs");
const { User } = require("../models");

const adminSeeder = async () => {
  try {
    const adminExists = await User.findOne({
      where: { username: "admin" },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin berhasil dibuat");
    } else {
      console.log("Admin sudah ada");
    }
  } catch (error) {
    console.error("Seeder admin error:", error.message);
  }
};

module.exports = adminSeeder;