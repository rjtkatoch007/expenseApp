const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        orderId: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },

        cfOrderId: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        paymentSessionId: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "PAID",
                "FAILED"
            ),
            allowNull: false,
            defaultValue: "PENDING"
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "orders",
        timestamps: true
    }
);

module.exports = Order;