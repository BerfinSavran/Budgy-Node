const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Category = sequelize.define("Category", {
        ID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        InExType: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        TotalAmount: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
        },
        LastResetMonth: {
            type: DataTypes.INTEGER,
            defaultValue: new Date().getMonth() + 1,
        },
        LastResetYear: {
            type: DataTypes.INTEGER,
            defaultValue: new Date().getFullYear(),
        }
    }, {
        timestamps: false,
    });
    return Category;
};
