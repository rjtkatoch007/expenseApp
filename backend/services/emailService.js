const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const sendForgotPasswordEmail = async (userEmail, requestId) => {
    const resetUrl =
        `http://localhost:3000/password/resetpassword/${requestId}`;

    const response = await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            name: process.env.BREVO_SENDER_NAME,
            email: process.env.BREVO_SENDER_EMAIL
        },

        to: [
            {
                email: userEmail
            }
        ],

        subject: "Expense Tracker - Reset Password",

        textContent: `
Hello,

We received a request to reset your Expense Tracker password.

Click the link below to reset your password:

${resetUrl}

This link can only be used once.

Thank you,
Expense Tracker Team
        `,

        htmlContent: `
            <h2>Expense Tracker</h2>

            <p>Hello,</p>

            <p>
                We received a request to reset your Expense Tracker password.
            </p>

            <p>
                Click the button below to reset your password:
            </p>

            <p>
                <a
                    href="${resetUrl}"
                    style="
                        display:inline-block;
                        padding:10px 20px;
                        background:#0d6efd;
                        color:white;
                        text-decoration:none;
                        border-radius:5px;
                    "
                >
                    Reset Password
                </a>
            </p>

            <p>
                Or copy this URL into your browser:
            </p>

            <p>${resetUrl}</p>

            <p>
                This link can only be used once.
            </p>

            <p>
                Thank you,<br>
                Expense Tracker Team
            </p>
        `
    });

    return response;
};

module.exports = {
    sendForgotPasswordEmail
};