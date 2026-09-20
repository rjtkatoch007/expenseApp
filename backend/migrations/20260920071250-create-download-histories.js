"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("download_histories", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id"
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            },

            fileName: {
                type: Sequelize.STRING,
                allowNull: false
            },

            fileUrl: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            s3Key: {
                type: Sequelize.STRING,
                allowNull: false
            },

            downloadedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW")
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("download_histories");
    }
};