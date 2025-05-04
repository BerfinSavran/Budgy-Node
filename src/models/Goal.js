const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Goal = sequelize.define('Goal', {
        ID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        UserId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        CategoryId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        Amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        Description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        StartDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        EndDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    },{
        timestamps:false,
    });

    Goal.associate = (models) => {
        Goal.belongsTo(models.User, {
            foreignKey: 'UserId',
            onDelete: 'RESTRICT'
        });
        Goal.belongsTo(models.Category, {
            foreignKey: 'CategoryId',
            onDelete: 'RESTRICT'
        });
    };

    return Goal;
};
