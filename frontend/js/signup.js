const signupForm = document.getElementById("signupForm");
const signupButton = document.getElementById("signupButton");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.className = "mt-3";
  message.textContent = "";
  signupButton.disabled = true;
  signupButton.textContent = "Signing up...";

  try {
    const response = await fetch("http://localhost:3000/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || "Signup failed");
    }

    message.className = "alert alert-success mt-3";
    message.textContent = data.message || "User signed up successfully!";
    signupForm.reset();
  } catch (error) {
    message.className = "alert alert-danger mt-3";
    message.textContent =
      error.message || "Unable to connect to the server.";
  } finally {
    signupButton.disabled = false;
    signupButton.textContent = "Signup";
  }
});
