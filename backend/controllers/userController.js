const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sequelize = require("../config/database");


const signup = async (req, res) => {
const transaction = await sequelize.transaction();
    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });

        }


        const existingUser =
            await User.findOne({
                where: {
                    email
                }
            });


        if (existingUser) {

            return res.status(409).json({
                message:
                    "User with this email already exists"
            });

        }

        //password encrypted
        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user =
            await User.create({

                name,

                email,

                password: hashedPassword

            },
            {
                transaction
        });

        await transaction.commit();
        return res.status(201).json({

            message:
                "User signed up successfully",

            user: {

                id: user.id,

                name: user.name,

                email: user.email

            }

        });


    } catch (error) {
        await transaction.rollback();
        console.error(
            "Signup error:",
            error
        );

        return res.status(500).json({

            message:
                "Internal server error"

        });

    }

};



const login = async (req, res) => {
    
    try {

        const {
            email,
            password
        } = req.body;


        // Validate input
        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        // Find user by email
        const user =
            await User.findOne({

                where: {
                    email
                }

            });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // Compare entered password
        // with hashed password in MySQL
        const passwordMatched =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatched) {

            return res.status(401).json({

                message:
                    "User not authorized"

            });

        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        return res.status(200).json({

            message:
                "Login successful",

                token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,
                isPremium: user.isPremium

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            message:
                "Internal server error"

        });

    }

};


module.exports = {
    signup,
    login
};