const express = require("express");
const cors = require("cors");
const app = express();
const PORT =
    process.env.PORT || 3000;

require("dotenv").config();

const sequelize =
    require("./config/database");

//Models
const User =
    require("./models/User");

const Expense =
    require("./models/Expense");

const Order = require("./models/Order");    

//Routes
const userRoutes =
    require("./routes/userRoutes");

const expenseRoutes =
    require("./routes/expenseRoutes");

const paymentRoutes = require("./routes/paymentRoutes");    

const premiumRoutes =
    require("./routes/premiumRoutes");

const passwordRoutes = require("./routes/passwordRoutes");    




//Middlewares
app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    "/premium",
    premiumRoutes
);
app.use("/password", passwordRoutes);

// Relationships

User.hasMany(Expense, {
    foreignKey: "userId"
});

Expense.belongsTo(User, {
    foreignKey: "userId"
});

User.hasMany(Order, {
    foreignKey: "userId"
});

Order.belongsTo(User, {
    foreignKey: "userId"
});


// Test route

app.get("/", (req, res) => {

    res.json({

        message:
            "Expense App backend is running"

    });

});


// Routes

app.use(
    "/user",
    userRoutes
);

app.use(
    "/expense",
    expenseRoutes
);

app.use("/payment", paymentRoutes);
// Start server

const startServer = async () => {

    try {

        await sequelize.authenticate();

        console.log(
            "MySQL database connected"
        );


        await sequelize.sync({ alter: true });

        console.log(
            "Database tables are ready"
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running at http://localhost:${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to start server:",
            error.message
        );

    }
};


startServer();