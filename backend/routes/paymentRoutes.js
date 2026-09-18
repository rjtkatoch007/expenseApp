const express = require("express");

const auth = require("../middleware/auth");

const {
    createPaymentOrder,
    getPaymentStatus
} = require("../controllers/paymentController");

const router = express.Router();


// Create Cashfree order
router.post(
    "/create-order",
    auth,
    createPaymentOrder
);


// Get payment status
router.get(
    "/status/:orderId",
    auth,
    getPaymentStatus
);


module.exports = router;