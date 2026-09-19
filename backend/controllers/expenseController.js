const Expense = require("../models/Expense");
const User = require("../models/User");
const sequelize = require("../config/database");
const { categorizeExpense } = require("../services/geminiService");
// ADD EXPENSE
const addExpense = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {

        const { amount, description, note } = req.body;


        if (!amount || !description) {
            await transaction.rollback();

            return res.status(400).json({
                message:
                    "Amount, description are required"
            });

        }

        // Ask Gemini to categorize the expense
        const category =
            await categorizeExpense(description);


        const expense = await Expense.create({

            amount,

            description,

            note,

            category,

            userId: req.user.id

        },{
            transaction
        });

        await User.increment(
            { totalexpenses: amount },
            { where: { id: req.user.id },
             transaction }
        );
        
        // Both operations succeeded
        await transaction.commit();

        res.status(201).json({

            message: "Expense added successfully",

            expense

        });


    } catch (error) {
        // Undo everything if anything fails
        await transaction.rollback();

        console.error(
            "Add expense error:",
            error
        );

        res.status(500).json({

            message:
                "Internal server error"

        });

    }
};



// GET ALL EXPENSES
const getExpenses = async (req, res) => {

    try {

        const expenses =
            await Expense.findAll({

                where: {
                    userId: req.user.id
                },

                order: [
                    ["createdAt", "DESC"]
                ]

            });


        res.status(200).json({

            expenses

        });


    } catch (error) {

        console.error(
            "Get expenses error:",
            error
        );

        res.status(500).json({

            message:
                "Internal server error"

        });

    }
};



// DELETE EXPENSE
const deleteExpense = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {

        const { id } = req.params;


        const expense =
            await Expense.findOne({

                where: {
                    id,
                    userId: req.user.id
                },
                transaction

            });


        if (!expense) {
            await transaction.rollback();

            return res.status(404).json({

                message:
                    "Expense not found"

            });

        }
        // Save amount before deleting the expense
        const amount = expense.amount;

        // Delete expense
        await expense.destroy({
            transaction
        });      

        // Decrease user's total expenses
        await User.decrement(
            {
                totalexpenses: amount
            },
            {
                where: {
                    id: req.user.id
                },
                transaction
            }
        );

        await transaction.commit();


        res.status(200).json({

            message:
                "Expense deleted successfully"

        });


    } catch (error) {
        await transaction.rollback();

        console.error(
            "Delete expense error:",
            error
        );

        res.status(500).json({

            message:
                "Internal server error"

        });

    }
};


module.exports = {
    addExpense,
    getExpenses,
    deleteExpense
};