const express = require("express");

const auth = require("../middleware/auth");

const {
    addExpense,
    getExpenses,
    deleteExpense
} = require("../controllers/expenseController");


const router = express.Router();


router.post(
    "/add",
    auth,
    addExpense
);


router.get(
    "/",
    auth,
    getExpenses
);


router.delete(
    "/:id",
    auth,
    deleteExpense
);


module.exports = router;