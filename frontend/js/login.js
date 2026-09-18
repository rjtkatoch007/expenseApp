//const axios = require("axios");

const loginForm = document.getElementById("loginForm");

const loginButton = document.getElementById("loginButton");

const message = document.getElementById("message");

const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const sendForgotPassword =
    document.getElementById("sendForgotPassword");

const forgotEmail =
    document.getElementById("forgotEmail");

const forgotPasswordMessage =
    document.getElementById("forgotPasswordMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;


    // Object that will be sent to backend
    const loginData = {
        email,
        password
    };


    console.log(loginData);


    loginButton.disabled = true;

    loginButton.textContent = "Logging in...";

    message.className = "mt-3";

    message.textContent = "";


    try {

        const response = await fetch(
            "http://localhost:3000/user/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Login failed"
            );

        }
        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href =
            "./expense.html";


        message.className =
            "alert alert-success mt-3";

        message.textContent =
            data.message;


        console.log("Logged in user:", data.user);


    } catch (error) {

        message.className =
            "alert alert-danger mt-3";

        message.textContent =
            error.message ||
            "Unable to connect to server.";

    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Login";

    }

});

forgotPasswordButton.addEventListener("click", () => {
    forgotPasswordForm.classList.toggle("d-none");
});

sendForgotPassword.addEventListener("click", async () => {

    const email = forgotEmail.value.trim();

    if (!email) {
        forgotPasswordMessage.textContent =
            "Please enter your email address.";

        forgotPasswordMessage.className =
            "mt-3 mb-0 text-danger";

        return;
    }

    try {

        sendForgotPassword.disabled = true;
        sendForgotPassword.textContent = "Sending...";

        const response = await axios.post(
            "http://localhost:3000/password/forgotpassword",
            {
                email: email
            }
        );

        forgotPasswordMessage.textContent =
            response.data.message;

        forgotPasswordMessage.className =
            "mt-3 mb-0 text-success";

    } catch (error) {

        console.log(
            "Forgot password error:",
            error
        );

        const message =
            error.response?.data?.message ||
            "Unable to send email.";

        forgotPasswordMessage.textContent =
            message;

        forgotPasswordMessage.className =
            "mt-3 mb-0 text-danger";

    } finally {

        sendForgotPassword.disabled = false;
        sendForgotPassword.textContent = "Send Email";
    }
});

