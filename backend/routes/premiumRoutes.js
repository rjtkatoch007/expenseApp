const express = require("express");

const auth = require("../middleware/auth");

const {
    showLeaderboard
} = require("../controllers/premiumController");

const router = express.Router();

router.get(
    "/showleaderboard",
    auth,
    showLeaderboard
);

module.exports = router;