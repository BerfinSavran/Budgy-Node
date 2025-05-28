const { Sequelize } = require("sequelize");
const UserModel = require("../models/User");
const CategoryModel = require("../models/Category");
const IncomeExpenseModel = require("../models/IncomeExpense");
const GoalModel = require("../models/Goal");

const sequelize = new Sequelize("Budgy", "budgy_user", "123!", {
    host: "localhost",
    dialect: "mssql",
    logging: false,
    dialectOptions: {
        options: {
            trustServerCertificate: true,
        },
    },
});

const User = UserModel(sequelize);
const Category = CategoryModel(sequelize);
const IncomeExpense = IncomeExpenseModel(sequelize);
const Goal = GoalModel(sequelize);

// İlişkiler
User.hasMany(Category, { foreignKey: "userId" });
Category.belongsTo(User, { foreignKey: "userId" });

User.hasMany(IncomeExpense, { foreignKey: "userId" });
IncomeExpense.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(IncomeExpense, { foreignKey: "categoryId" });
IncomeExpense.belongsTo(Category, { foreignKey: "categoryId" });

User.hasMany(Goal, { foreignKey: "userId" });
Goal.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Goal, { foreignKey: "categoryId" });
Goal.belongsTo(Category, { foreignKey: "categoryId" });


// Bağlantıyı test et
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ MSSQL bağlantısı başarılı!");
    } catch (error) {
        console.error("❌ MSSQL bağlantı hatası:", error);
    }
};

testConnection();

module.exports = {
    sequelize,
    User,
    Category,
    IncomeExpense,
    Goal,
  };