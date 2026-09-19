const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
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

const ForgotPasswordRequest = require("./models/ForgotPasswordRequest");

//Routes
const userRoutes =
    require("./routes/userRoutes");

const expenseRoutes =
    require("./routes/expenseRoutes");

const paymentRoutes = require("./routes/paymentRoutes");    

const premiumRoutes =
    require("./routes/premiumRoutes");

const passwordRoutes = require("./routes/passwordRoutes");    

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:'a'});


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
app.use(morgan('combined', {stream: accessLogStream}));

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

User.hasMany(ForgotPasswordRequest, {
    foreignKey: "userId"
});

ForgotPasswordRequest.belongsTo(User, {
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