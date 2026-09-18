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

// ==========================================
// PAGINATION
// ==========================================

const ITEMS_PER_PAGE = 5;

let currentPage = 1;

let allExpenses = [];

const previousPage =
    document.getElementById("previousPage");

const nextPage =
    document.getElementById("nextPage");

const pageNumbers =
    document.getElementById("pageNumbers");

const paginationContainer =
    document.getElementById("paginationContainer");


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

        allExpenses = data.expenses || [];

        currentPage = 1;


        displayExpenses(
            //data.expenses
        );

        localStorage.setItem(
    "expenses",
    JSON.stringify(data.expenses)
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

/* const displayExpenses =
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
 */

function displayExpenses() {

    expensesContainer.innerHTML = "";


    // ======================================
    // TOTAL PAGES
    // ======================================

    const totalPages =
        Math.ceil(
            allExpenses.length /
            ITEMS_PER_PAGE
        );


    // ======================================
    // HANDLE NO EXPENSES
    // ======================================

    if (allExpenses.length === 0) {

        expensesContainer.innerHTML = `
            <div class="alert alert-info text-center">
                No expenses found.
            </div>
        `;

        paginationContainer.classList.add(
            "d-none"
        );

        return;
    }


    paginationContainer.classList.remove(
        "d-none"
    );


    // ======================================
    // MAKE SURE PAGE IS VALID
    // ======================================

    if (currentPage > totalPages) {

        currentPage = totalPages;

    }

    if (currentPage < 1) {

        currentPage = 1;

    }


    // ======================================
    // START / END INDEX
    // ======================================

    const startIndex =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

    const endIndex =
        startIndex +
        ITEMS_PER_PAGE;


    // ======================================
    // GET ONLY 10 EXPENSES
    // ======================================

    const currentExpenses =
        allExpenses.slice(
            startIndex,
            endIndex
        );


    // ======================================
    // DISPLAY EXPENSES
    // ======================================

    currentExpenses.forEach(
        expense => {

            const expenseElement =
                document.createElement("div");


            expenseElement.className =
                "card mb-3 shadow-sm";


            expenseElement.innerHTML = `

                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center">

                        <div>

                            <h5 class="mb-1">
                                ${expense.description}
                            </h5>

                            <p class="text-muted mb-0">
                                ${expense.category}
                            </p>

                        </div>


                        <div class="text-end">

                            <h5 class="text-danger mb-2">
                                ₹${Number(
                                    expense.amount
                                ).toFixed(2)}
                            </h5>

                            <button
                                class="btn btn-danger btn-sm delete-expense"
                                data-id="${expense.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            `;


            expensesContainer.appendChild(
                expenseElement
            );

        }
    );


    // ======================================
    // DELETE BUTTONS
    // ======================================

    const deleteButtons =
        document.querySelectorAll(
            ".delete-expense"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const expenseId =
                        button.dataset.id;

                    deleteExpense(
                        expenseId
                    );

                }
            );

        }
    );


    // ======================================
    // UPDATE PAGINATION
    // ======================================

    renderPagination(
        totalPages
    );

}

function renderPagination(totalPages) {

    pageNumbers.innerHTML = "";


    // ======================================
    // PREVIOUS BUTTON
    // ======================================

    previousPage.disabled =
        currentPage === 1;


    // ======================================
    // NEXT BUTTON
    // ======================================

    nextPage.disabled =
        currentPage === totalPages;


    // ======================================
    // PAGE NUMBERS
    // ======================================

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.textContent = page;


        button.className =
            page === currentPage
                ? "btn btn-primary"
                : "btn btn-outline-primary";


        button.addEventListener(
            "click",
            () => {

                currentPage = page;

                displayExpenses();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        pageNumbers.appendChild(
            button
        );

    }

}

function renderPagination(totalPages) {

    pageNumbers.innerHTML = "";


    // ======================================
    // PREVIOUS BUTTON
    // ======================================

    previousPage.disabled =
        currentPage === 1;


    // ======================================
    // NEXT BUTTON
    // ======================================

    nextPage.disabled =
        currentPage === totalPages;


    // ======================================
    // PAGE NUMBERS
    // ======================================

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.textContent = page;


        button.className =
            page === currentPage
                ? "btn btn-primary"
                : "btn btn-outline-primary";


        button.addEventListener(
            "click",
            () => {

                currentPage = page;

                displayExpenses();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        pageNumbers.appendChild(
            button
        );

    }

}


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

const reportsButton =
    document.getElementById("reportsButton");

reportsButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "reports.html";

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