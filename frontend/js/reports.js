const API_URL = "http://localhost:3000";


// ==========================================
// GET USER
// ==========================================

const user = JSON.parse(
    localStorage.getItem("user")
);

const token = localStorage.getItem("token");


// ==========================================
// DOM ELEMENTS
// ==========================================

const premiumWarning =
    document.getElementById("premiumWarning");

const reportContent =
    document.getElementById("reportContent");

const downloadButton =
    document.getElementById("downloadButton");

const totalIncomeElement =
    document.getElementById("totalIncome");

const totalExpenseElement =
    document.getElementById("totalExpense");

const balanceElement =
    document.getElementById("balance");

const transactionTableBody =
    document.getElementById("transactionTableBody");

const transactionCount =
    document.getElementById("transactionCount");

const noTransactions =
    document.getElementById("noTransactions");

const filterButtons =
    document.querySelectorAll(".filter-button");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!token || !user) {

    window.location.href = "login.html";

}


// ==========================================
// CHECK PREMIUM
// ==========================================

const isPremium = user.isPremium === true;


if (!isPremium) {

    premiumWarning.classList.remove("d-none");

    reportContent.classList.add("d-none");

    downloadButton.disabled = true;

    downloadButton.title =
        "Premium membership is required";

} else {

    premiumWarning.classList.add("d-none");

    reportContent.classList.remove("d-none");

    downloadButton.disabled = false;

}


// ==========================================
// SAMPLE DATA
// ==========================================
//
// Backend is NOT being changed.
// Therefore this page currently uses the
// expenses already stored in localStorage.
//
// If your expense.js stores expenses under
// another key, change "expenses" below.
//

let allTransactions =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];


// ==========================================
// NORMALIZE EXPENSE DATA
// ==========================================

allTransactions = allTransactions.map(
    expense => {

        return {
            id: expense.id,

            description:
                expense.description || "Expense",

            amount:
                Number(expense.amount) || 0,

            category:
                expense.category || "Other",

            type:
                expense.type || "expense",

            createdAt:
                expense.createdAt ||
                expense.date ||
                new Date().toISOString()
        };

    }
);


// ==========================================
// CURRENT FILTER
// ==========================================

let currentPeriod = "all";


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR"
        }
    ).format(amount);

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// CHECK TODAY
// ==========================================

function isToday(date) {

    const transactionDate =
        new Date(date);

    const today =
        new Date();

    return (
        transactionDate.getDate() ===
            today.getDate() &&

        transactionDate.getMonth() ===
            today.getMonth() &&

        transactionDate.getFullYear() ===
            today.getFullYear()
    );

}


// ==========================================
// CHECK THIS WEEK
// ==========================================

function isThisWeek(date) {

    const transactionDate =
        new Date(date);

    const today =
        new Date();

    const day =
        today.getDay();

    const difference =
        day === 0 ? 6 : day - 1;

    const startOfWeek =
        new Date(today);

    startOfWeek.setDate(
        today.getDate() - difference
    );

    startOfWeek.setHours(
        0,
        0,
        0,
        0
    );

    const endOfWeek =
        new Date(startOfWeek);

    endOfWeek.setDate(
        startOfWeek.getDate() + 7
    );

    return (
        transactionDate >= startOfWeek &&
        transactionDate < endOfWeek
    );

}


// ==========================================
// CHECK THIS MONTH
// ==========================================

function isThisMonth(date) {

    const transactionDate =
        new Date(date);

    const today =
        new Date();

    return (
        transactionDate.getMonth() ===
            today.getMonth() &&

        transactionDate.getFullYear() ===
            today.getFullYear()
    );

}


// ==========================================
// FILTER TRANSACTIONS
// ==========================================

function filterTransactions() {

    if (currentPeriod === "all") {

        return allTransactions;

    }

    if (currentPeriod === "daily") {

        return allTransactions.filter(
            transaction =>
                isToday(transaction.createdAt)
        );

    }

    if (currentPeriod === "weekly") {

        return allTransactions.filter(
            transaction =>
                isThisWeek(transaction.createdAt)
        );

    }

    if (currentPeriod === "monthly") {

        return allTransactions.filter(
            transaction =>
                isThisMonth(transaction.createdAt)
        );

    }

    return allTransactions;

}


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function displayTransactions() {

    const transactions =
        filterTransactions();

    transactionTableBody.innerHTML = "";

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(transaction.amount) || 0;

            const type =
                transaction.type.toLowerCase();


            if (
                type === "income" ||
                transaction.category === "Salary"
            ) {

                totalIncome += amount;

            } else {

                totalExpense += amount;

            }


            const row =
                document.createElement("tr");


            const amountClass =
                type === "income" ||
                transaction.category === "Salary"
                    ? "text-success"
                    : "text-danger";


            const typeText =
                type === "income" ||
                transaction.category === "Salary"
                    ? "Income"
                    : "Expense";


            row.innerHTML = `

                <td>
                    ${formatDate(transaction.createdAt)}
                </td>

                <td>
                    ${transaction.description}
                </td>

                <td>
                    <span class="badge bg-secondary">
                        ${transaction.category}
                    </span>
                </td>

                <td>
                    <span class="${amountClass}">
                        ${typeText}
                    </span>
                </td>

                <td class="text-end fw-bold ${amountClass}">
                    ${formatCurrency(amount)}
                </td>

            `;

            transactionTableBody.appendChild(row);

        }
    );


    // ======================================
    // SUMMARY
    // ======================================

    const balance =
        totalIncome - totalExpense;


    totalIncomeElement.textContent =
        formatCurrency(totalIncome);

    totalExpenseElement.textContent =
        formatCurrency(totalExpense);

    balanceElement.textContent =
        formatCurrency(balance);


    // ======================================
    // COUNT
    // ======================================

    transactionCount.textContent =
        `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;


    // ======================================
    // EMPTY STATE
    // ======================================

    if (transactions.length === 0) {

        noTransactions.classList.remove(
            "d-none"
        );

    } else {

        noTransactions.classList.add(
            "d-none"
        );

    }

}


// ==========================================
// FILTER BUTTONS
// ==========================================

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(
                item => {

                    item.classList.remove(
                        "btn-primary"
                    );

                    item.classList.add(
                        "btn-outline-primary"
                    );

                }
            );


            button.classList.remove(
                "btn-outline-primary"
            );

            button.classList.add(
                "btn-primary"
            );


            currentPeriod =
                button.dataset.period;


            displayTransactions();

        }
    );

});


// ==========================================
// DOWNLOAD CSV
// ==========================================

downloadButton.addEventListener(
    "click",
    () => {

        if (!isPremium) {

            return;

        }


        const transactions =
            filterTransactions();


        if (transactions.length === 0) {

            alert(
                "There are no transactions to download."
            );

            return;

        }


        const headers = [
            "Date",
            "Description",
            "Category",
            "Type",
            "Amount"
        ];


        const rows =
            transactions.map(
                transaction => {

                    const type =
                        transaction.type.toLowerCase();

                    const isIncome =
                        type === "income" ||
                        transaction.category === "Salary";


                    return [
                        formatDate(
                            transaction.createdAt
                        ),

                        transaction.description,

                        transaction.category,

                        isIncome
                            ? "Income"
                            : "Expense",

                        transaction.amount
                    ];

                }
            );


        const csvContent = [

            headers,

            ...rows

        ]
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(value)
                                    .replace(/"/g, '""')}"`
                        )
                        .join(",")
            )
            .join("\n");


        const blob =
            new Blob(
                [csvContent],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        const periodName =
            currentPeriod.charAt(0).toUpperCase() +
            currentPeriod.slice(1);


        link.download =
            `expense-report-${periodName}.csv`;


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }
);


// ==========================================
// INITIAL DISPLAY
// ==========================================

if (isPremium) {

    displayTransactions();

}