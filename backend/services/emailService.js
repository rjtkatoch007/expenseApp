const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const sendForgotPasswordEmail = async (userEmail) => {
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

        subject: "Expense Tracker - Forgot Password",

        textContent: `
Hello,

We received a forgot password request for your Expense Tracker account.

This is a dummy email for now.

Password reset functionality will be added soon.

Thank you,
Expense Tracker Team
        `,

        htmlContent: `
            <h2>Expense Tracker</h2>

            <p>Hello,</p>

            <p>
                We received a forgot password request for your
                Expense Tracker account.
            </p>

            <p>
                This is a dummy email for now.
            </p>

            <p>
                Password reset functionality will be added soon.
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