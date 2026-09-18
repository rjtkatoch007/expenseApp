const API_URL =
    "http://localhost:3000";


const token =
    localStorage.getItem("token");

const user =
    JSON.parse(
        localStorage.getItem("user")
    );
    
const premiumMessage =
    document.getElementById("premiumMessage");


if (user && user.isPremium) {

    premiumMessage.classList.remove("d-none");

}

// Don't allow access without login

if (!token || !user) {

    window.location.href =
        "./login.html";

}


// Display user name

document.getElementById(
    "welcomeUser"
).textContent =
    `Welcome, ${user.name}`;


const expenseForm =
    document.getElementById(
        "expenseForm"
    );


const addExpenseButton =
    document.getElementById(
        "addExpenseButton"
    );


const expensesContainer =
    document.getElementById(
        "expensesContainer"
    );


const expenseMessage =
    document.getElementById(
        "expenseMessage"
    );

const leaderboardButton =
    document.getElementById(
        "leaderboardButton"
    );

leaderboardButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "leaderboard.html";

    }
);    


// =====================================
// FETCH EXPENSES
// =====================================

const fetchExpenses = async () => {

    try {

        const response =
            await fetch(
                `${API_URL}/expense`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        displayExpenses(
            data.expenses
        );


    } catch (error) {

        expensesContainer.innerHTML = `

            <div class="alert alert-danger">
                ${error.message}
            </div>

        `;

    }

};



// =====================================
// DISPLAY EXPENSES
// =====================================

const displayExpenses =
    (expenses) => {


    if (expenses.length === 0) {

        expensesContainer.innerHTML = `

            <div class="text-center text-muted py-4">

                No expenses added yet.

            </div>

        `;

        return;

    }


    expensesContainer.innerHTML =
        expenses.map(
            (expense) => `

            <div
                class="border rounded p-3 mb-3"
            >

                <div
                    class="d-flex justify-content-between align-items-start"
                >

                    <div>

                        <h5 class="mb-1">
                            ₹${expense.amount}
                        </h5>

                        <p class="mb-1">
                            ${expense.description}
                        </p>

                        <span
                            class="badge bg-secondary"
                        >
                            ${expense.category}
                        </span>

                    </div>


                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `
        ).join("");

};



// =====================================
// ADD EXPENSE
// =====================================

expenseForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const amount =
            document.getElementById(
                "amount"
            ).value;


        const description =
            document.getElementById(
                "description"
            ).value;


       /*  const category =
            document.getElementById(
                "category"
            ).value; */


        // Object sent to backend

        /* const expenseData = {

            amount,

            description,

            category

        }; */


       /*  console.log(
            "Expense:",
            expenseData
        ); */


        addExpenseButton.disabled =
            true;


        addExpenseButton.textContent =
            "Adding...";


        try {

            const response =
                await fetch(
                    `${API_URL}/expense/add`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({
                                amount,
                                description
                            })
                    }
                );


            const data =
                await response.json();

                 if (response.ok) {

                alert(
                    `Expense added successfully!\n\n` +
                    `AI Category: ${data.expense.category}`
                );

                fetchExpenses();

            }


            if (!response.ok) {

                throw new Error(
                    data.message
                );

            }          


            expenseMessage.className =
                "alert alert-success mt-3";


            expenseMessage.textContent =
                data.message;


            expenseForm.reset();


            // Fetch updated expenses

            await fetchExpenses();


        } catch (error) {

            expenseMessage.className =
                "alert alert-danger mt-3";


            expenseMessage.textContent =
                error.message;

        } finally {

            addExpenseButton.disabled =
                false;


            addExpenseButton.textContent =
                "Add Expense";

        }

    }
);



// =====================================
// DELETE EXPENSE
// =====================================

const deleteExpense =
    async (id) => {

    try {

        const response =
            await fetch(
                `${API_URL}/expense/${id}`,
                {
                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        // Refresh list

        await fetchExpenses();


    } catch (error) {

        alert(error.message);

    }

};



// =====================================
// LOGOUT
// =====================================

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        window.location.href =
            "./login.html";

    }
);

//Add Cashfree checkout
const premiumButton =
    document.getElementById("premiumButton");

premiumButton.addEventListener("click", async () => {

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:3000/payment/create-order",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to create order");
            return;
        }


        const cashfree = Cashfree({
            mode: "sandbox"
        });


        cashfree.checkout({
            paymentSessionId:
                data.paymentSessionId,

            redirectTarget: "_self"
        });

    } catch (error) {

        console.error(error);

        alert("Unable to start payment");
    }
});

// Load old expenses when page opens

fetchExpenses();