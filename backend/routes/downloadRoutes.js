const express = require("express");

const auth = require("../middleware/auth");

const {
    downloadExpenses,
    getDownloadHistory
} = require("../controllers/downloadController");

const router = express.Router();

router.get(
    "/expenses",
    auth,
    downloadExpenses
);

router.get(
    "/history",
    auth,
    getDownloadHistory
);

module.exports = router;