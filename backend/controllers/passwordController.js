const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const ForgotPasswordRequest = require("../models/ForgotPasswordRequest");
const sequelize = require("../config/database");

const {
    sendForgotPasswordEmail
} = require("../services/emailService");


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPassword = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { email } = req.body;

        if (!email) {
            await transaction.rollback();

            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            where: {
                email
            },
            transaction
        });

        if (!user) {
            await transaction.rollback();

            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        // Generate UUID
        const requestId = uuidv4();

        console.log("Generated reset UUID:", requestId);

        // Create forgot password request
        await ForgotPasswordRequest.create(
            {
                id: requestId,
                userId: user.id,
                isActive: true
            },
            {
                transaction
            }
        );

        // Commit database transaction first
        await transaction.commit();

        // Send email after database request has been created
        await sendForgotPasswordEmail(
            user.email,
            requestId
        );

        res.status(200).json({
            message: "Password reset email sent successfully"
        });

    } catch (error) {

        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.log("Rollback error:", rollbackError);
        }

        console.log("Forgot password error:", error);

        res.status(500).json({
            message: "Unable to process forgot password request"
        });
    }
};


// ========================================
// RESET PASSWORD PAGE
// ========================================

const resetPasswordPage = async (req, res) => {
    try {

        const { requestId } = req.params;

        console.log("Reset request ID:", requestId);

        const request = await ForgotPasswordRequest.findOne({
            where: {
                id: requestId,
                isActive: true
            }
        });

        if (!request) {

            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Reset Link</title>
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                    >
                </head>

                <body class="bg-light">

                    <div class="container mt-5">

                        <div class="card shadow p-4 mx-auto"
                             style="max-width:500px;">

                            <h3 class="text-danger">
                                Invalid or Expired Link
                            </h3>

                            <p>
                                This password reset link has already been
                                used or does not exist.
                            </p>

                        </div>

                    </div>

                </body>
                </html>
            `);
        }

        // Request exists and is active
        res.send(`
            <!DOCTYPE html>

            <html>

            <head>

                <title>Reset Password</title>

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                >

                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                >

            </head>

            <body class="bg-light">

                <div class="container mt-5">

                    <div
                        class="card shadow p-4 mx-auto"
                        style="max-width:500px;"
                    >

                        <h2 class="text-center mb-4">
                            Reset Password
                        </h2>

                        <form id="resetPasswordForm">

                            <div class="mb-3">

                                <label
                                    class="form-label"
                                    for="password"
                                >
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    id="password"
                                    class="form-control"
                                    minlength="6"
                                    required
                                >

                            </div>

                            <div class="mb-3">

                                <label
                                    class="form-label"
                                    for="confirmPassword"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    id="confirmPassword"
                                    class="form-control"
                                    minlength="6"
                                    required
                                >

                            </div>

                            <button
                                type="submit"
                                class="btn btn-primary w-100"
                            >
                                Update Password
                            </button>

                            <p
                                id="message"
                                class="mt-3 text-center"
                            ></p>

                        </form>

                    </div>

                </div>


                <script>

                    const form =
                        document.getElementById("resetPasswordForm");

                    const message =
                        document.getElementById("message");

                    form.addEventListener("submit", async (event) => {

                        event.preventDefault();

                        const password =
                            document.getElementById("password").value;

                        const confirmPassword =
                            document.getElementById("confirmPassword").value;

                        if (password !== confirmPassword) {

                            message.textContent =
                                "Passwords do not match.";

                            message.className =
                                "mt-3 text-center text-danger";

                            return;
                        }

                        try {

                            const response = await fetch(
                                "/password/updatepassword/${requestId}",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        password
                                    })
                                }
                            );

                            const data =
                                await response.json();

                            if (!response.ok) {
                                throw new Error(data.message);
                            }

                            message.textContent =
                                data.message;

                            message.className =
                                "mt-3 text-center text-success";

                            form.reset();

                        } catch (error) {

                            console.log(error);

                            message.textContent =
                                error.message ||
                                "Unable to update password.";

                            message.className =
                                "mt-3 text-center text-danger";
                        }

                    });

                </script>

            </body>

            </html>
        `);

    } catch (error) {

        console.log("Reset password page error:", error);

        res.status(500).send("Unable to open reset password page");
    }
};


// ========================================
// UPDATE PASSWORD
// ========================================

const updatePassword = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const { requestId } = req.params;
        const { password } = req.body;

        if (!password) {

            await transaction.rollback();

            return res.status(400).json({
                message: "Password is required"
            });
        }

        if (password.length < 6) {

            await transaction.rollback();

            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Find active forgot password request
        const request = await ForgotPasswordRequest.findOne({
            where: {
                id: requestId,
                isActive: true
            },
            transaction
        });

        if (!request) {

            await transaction.rollback();

            return res.status(400).json({
                message: "Invalid or expired password reset link"
            });
        }

        // Find the user
        const user = await User.findByPk(
            request.userId,
            {
                transaction
            }
        );

        if (!user) {

            await transaction.rollback();

            return res.status(404).json({
                message: "User not found"
            });
        }

        // Encrypt / hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Update user's password
        await user.update(
            {
                password: hashedPassword
            },
            {
                transaction
            }
        );

        // VERY IMPORTANT:
        // Make reset request inactive
        await request.update(
            {
                isActive: false
            },
            {
                transaction
            }
        );

        await transaction.commit();

        res.status(200).json({
            message:
                "Password updated successfully. You can now login."
        });

    } catch (error) {

        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.log("Rollback error:", rollbackError);
        }

        console.log("Update password error:", error);

        res.status(500).json({
            message: "Unable to update password"
        });
    }
};


module.exports = {
    forgotPassword,
    resetPasswordPage,
    updatePassword
};