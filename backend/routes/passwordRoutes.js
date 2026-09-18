const express = require("express");

const {
    forgotPassword,
    resetPasswordPage,
    updatePassword
} = require("../controllers/passwordController");

const router = express.Router();


// Send forgot password email
router.post(
    "/forgotpassword",
    forgotPassword
);


// Open reset password URL
router.get(
    "/resetpassword/:requestId",
    resetPasswordPage
);


// Update password
router.post(
    "/updatepassword/:requestId",
    updatePassword
);


module.exports = router;