const User = require("../models/User");
const { sendForgotPasswordEmail } = require("../services/emailService");

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        await sendForgotPasswordEmail(user.email);

        res.status(200).json({
            message: "Forgot password email sent successfully"
        });

    } catch (error) {
        console.log("Forgot password error:", error);

        res.status(500).json({
            message: "Unable to send forgot password email"
        });
    }
};

module.exports = {
    forgotPassword
};