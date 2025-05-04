const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const IncomeExpense = sequelize.define("IncomeExpense", {
    ID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    CategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    Amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    InExType: {
      type: DataTypes.ENUM("Income", "Expense"),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    }
},{
    timestamps:false,
});

  return IncomeExpense;
};
