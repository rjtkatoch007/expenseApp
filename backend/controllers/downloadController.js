const Expense = require("../models/Expense");
const User = require("../models/User");
const DownloadHistory = require("../models/DownloadHistory");

const sequelize = require("../config/database");

const {
    uploadFileToS3,
    generateDownloadUrl
} = require("../services/s3Service");

//const logger = require("../utils/logger");


// Download all expenses
const downloadExpenses = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        // ---------------------------------------
        // 1. Find logged-in user
        // ---------------------------------------

        const user = await User.findByPk(req.user.id);

        if (!user) {
            await transaction.rollback();

            return res.status(401).json({
                message: "Unauthorized"
            });
        }


        // ---------------------------------------
        // 2. Check premium membership
        // ---------------------------------------

        if (!user.isPremium) {
            await transaction.rollback();

            return res.status(401).json({
                message: "Premium membership required"
            });
        }


        // ---------------------------------------
        // 3. Get user's expenses
        // ---------------------------------------

        const expenses = await Expense.findAll({
            where: {
                userId: req.user.id
            },
            order: [["createdAt", "DESC"]]
        });


        // ---------------------------------------
        // 4. Create CSV
        // ---------------------------------------

        let csv = "ID,Amount,Description,Category,Note,Date\n";

        expenses.forEach((expense) => {
            const description = escapeCsvValue(expense.description);
            const category = escapeCsvValue(expense.category);
            const note = escapeCsvValue(expense.note || "");

            csv += `${expense.id},${expense.amount},${description},${category},${note},${expense.createdAt}\n`;
        });


        // ---------------------------------------
        // 5. Create unique S3 file name
        // ---------------------------------------

        const timestamp = Date.now();

        const fileName = `expenses-${req.user.id}-${timestamp}.csv`;

        const s3Key = `expenses/${req.user.id}/${fileName}`;


        // ---------------------------------------
        // 6. Upload CSV to S3
        // ---------------------------------------

        await uploadFileToS3(
            Buffer.from(csv, "utf-8"),
            s3Key
        );


        // ---------------------------------------
        // 7. Generate download URL
        // ---------------------------------------

        const fileUrl = await generateDownloadUrl(s3Key);


        // ---------------------------------------
        // 8. Save download history
        // ---------------------------------------

        await DownloadHistory.create(
            {
                userId: req.user.id,
                fileName,
                fileUrl,
                s3Key,
                downloadedAt: new Date()
            },
            {
                transaction
            }
        );


        // ---------------------------------------
        // 9. Commit database transaction
        // ---------------------------------------

        await transaction.commit();

        /* logger.info(
            `Expense export created. User ID: ${req.user.id}, File: ${fileName}`
        ); */


        // ---------------------------------------
        // 10. Send URL to frontend
        // ---------------------------------------

        return res.status(200).json({
            message: "Expense file generated successfully",
            fileName,
            fileUrl
        });

    } catch (error) {

        await transaction.rollback();

       /*  logger.error(
            `Expense download error: ${error.message}\n${error.stack}`
        ); */

        return res.status(500).json({
            message: "Unable to generate expense file"
        });
    }
};


// Escape CSV values
const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    const stringValue = String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

const getDownloadHistory = async (req, res) => {
    try {

        const user = await User.findByPk(req.user.id);

        if (!user || !user.isPremium) {
            return res.status(401).json({
                message: "Premium membership required"
            });
        }

        const downloads = await DownloadHistory.findAll({
            where: {
                userId: req.user.id
            },
            order: [["downloadedAt", "DESC"]]
        });

        const downloadsWithFreshUrls = await Promise.all(
            downloads.map(async (download) => {

                const freshUrl =
                    await generateDownloadUrl(download.s3Key);

                return {
                    id: download.id,
                    fileName: download.fileName,
                    downloadedAt: download.downloadedAt,
                    fileUrl: freshUrl
                };
            })
        );

        return res.status(200).json({
            downloads: downloadsWithFreshUrls
        });

    } catch (error) {

       /*  logger.error(
            `Download history error: ${error.message}\n${error.stack}`
        ); */

        return res.status(500).json({
            message: "Unable to get download history"
        });
    }
};


module.exports = {
    downloadExpenses,
    getDownloadHistory
};