const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ForgotPasswordRequest = sequelize.define(
    "ForgotPasswordRequest",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        tableName: "ForgotPasswordRequests",
        timestamps: true
    }
);

module.exports = ForgotPasswordRequest;