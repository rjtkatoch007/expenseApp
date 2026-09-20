const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DownloadHistory = sequelize.define(
    "DownloadHistory",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },

        fileUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        s3Key: {
            type: DataTypes.STRING,
            allowNull: false
        },

        downloadedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "download_histories",
        timestamps: true
    }
);

module.exports = DownloadHistory;