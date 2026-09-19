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
// DYNAMIC PAGINATION
// ==========================================

const DEFAULT_EXPENSES_PER_PAGE = 10;

const AVAILABLE_PAGE_SIZES = [
    5,
    10,
    20,
    50,
    100
];

let currentPage = 1;

let allExpenses = [];


// ==========================================
// GET CURRENT USER
// ==========================================

const loggedInUser =
    JSON.parse(
        localStorage.getItem("user")
    );


// ==========================================
// USER-SPECIFIC LOCAL STORAGE KEY
// ==========================================

const pageSizeStorageKey =
    loggedInUser
        ? `expensesPerPage_${loggedInUser.id}`
        : "expensesPerPage";


// ==========================================
// LOAD SAVED PAGE SIZE
// ==========================================

function getSavedPageSize() {

    const savedValue =
        Number(
            localStorage.getItem(
                pageSizeStorageKey
            )
        );


    // Check whether saved value is valid

    if (
        AVAILABLE_PAGE_SIZES.includes(
            savedValue
        )
    ) {

        return savedValue;

    }


    // If nothing valid is saved

    return DEFAULT_EXPENSES_PER_PAGE;

}


let expensesPerPage =
    getSavedPageSize();



const previousPage =
    document.getElementById("previousPage");

const nextPage =
    document.getElementById("nextPage");

const pageNumbers =
    document.getElementById("pageNumbers");

const paginationContainer =
    document.getElementById("paginationContainer");

const expensesPerPageSelect =
    document.getElementById(
        "expensesPerPage"
    );

const expenseRange =
    document.getElementById(
        "expenseRange"
    );    


// =====================================
// FETCH EXPENSES
// =====================================
async function fetchExpenses() {

    try {

        const response =  await fetch(
                `${API_URL}/expense`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load expenses"
            );

        }


        const data =
            await response.json();


        allExpenses =
            data.expenses || [];


        // Save expenses for reports page
        localStorage.setItem(
            "expenses",
            JSON.stringify(
                allExpenses
            )
        );


        // ==================================
        // CALCULATE NEW TOTAL PAGES
        // ==================================

        const totalPages =
            getTotalPages();


        // ==================================
        // EDGE CASE:
        // CURRENT PAGE NO LONGER EXISTS
        // ==================================

        if (
            totalPages === 0
        ) {

            currentPage = 1;

        } else if (
            currentPage > totalPages
        ) {

            currentPage =
                totalPages;

        }


        displayExpenses();


    } catch (error) {

        console.log(
            "Load expenses error:",
            error
        );

    }

}

function getTotalPages() {

    if (allExpenses.length === 0) {

        return 0;

    }


    return Math.ceil(
        allExpenses.length /
        expensesPerPage
    );

}

// =====================================
// DISPLAY EXPENSES
// =====================================
function displayExpenses() {

    expensesContainer.innerHTML = "";


    // ======================================
    // TOTAL NUMBER OF PAGES
    // ======================================

    const totalPages =
        getTotalPages();


    // ======================================
    // NO EXPENSES
    // ======================================

    if (
        allExpenses.length === 0
    ) {

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


    // ======================================
    // MAKE SURE CURRENT PAGE IS VALID
    // ======================================

    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages;

    }


    if (
        currentPage < 1
    ) {

        currentPage = 1;

    }


    paginationContainer.classList.remove(
        "d-none"
    );


    // ======================================
    // CALCULATE ARRAY POSITIONS
    // ======================================

    const startIndex =
        (currentPage - 1) *
        expensesPerPage;


    const endIndex =
        startIndex +
        expensesPerPage;


    // ======================================
    // ONLY DISPLAY CURRENT PAGE
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
                document.createElement(
                    "div"
                );


            expenseElement.className =
                "card mb-3 shadow-sm";


            expenseElement.innerHTML = `

                <div class="card-body">

                    <div
                        class="d-flex
                        justify-content-between
                        align-items-center"
                    >

                        <div>

                            <h5 class="mb-1">
                                ${expense.description}
                            </h5>

                            <p class="text-muted mb-0">
                                ${expense.category}
                            </p>

                            <p class="mb-0">
                                <strong>Note:</strong>
                                ${expense.note || "No note added"}
                            </p>

                        </div>


                        <div class="text-end">

                            <h5
                                class="text-danger mb-2"
                            >
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
    // SHOWING X - Y OF Z
    // ======================================

    const startDisplay =
        startIndex + 1;


    const endDisplay =
        Math.min(
            endIndex,
            allExpenses.length
        );


    expenseRange.textContent =
        `Showing ${startDisplay} - ${endDisplay} of ${allExpenses.length} expenses`;


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
    // RENDER PAGINATION
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
            document.createElement(
                "button"
            );


        button.type = "button";

        button.textContent = page;


        button.className =
            page === currentPage
                ? "btn btn-primary"
                : "btn btn-outline-primary";


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;


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

previousPage.addEventListener(
    "click",
    () => {

        if (
            currentPage <= 1
        ) {

            return;

        }


        currentPage--;


        displayExpenses();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

nextPage.addEventListener(
    "click",
    () => {

        const totalPages =
            getTotalPages();


        if (
            currentPage >= totalPages
        ) {

            return;

        }


        currentPage++;


        displayExpenses();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

expensesPerPageSelect.addEventListener(
    "change",
    () => {

        const selectedValue =
            Number(
                expensesPerPageSelect.value
            );


        // ==================================
        // VALIDATE VALUE
        // ==================================

        if (
            !AVAILABLE_PAGE_SIZES.includes(
                selectedValue
            )
        ) {

            expensesPerPage =
                DEFAULT_EXPENSES_PER_PAGE;

            expensesPerPageSelect.value =
                DEFAULT_EXPENSES_PER_PAGE;

        } else {

            expensesPerPage =
                selectedValue;

        }


        // ==================================
        // SAVE FOR THIS USER
        // ==================================

        localStorage.setItem(
            pageSizeStorageKey,
            expensesPerPage
        );


        // ==================================
        // RESET TO PAGE 1
        // ==================================

        currentPage = 1;


        // ==================================
        // REDRAW
        // ==================================

        displayExpenses();

    }
);
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


       const note =
            document.getElementById("note").value;


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
                                description,
                                note
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