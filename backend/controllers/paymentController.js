const { Cashfree } = require("cashfree-pg");
const Order = require("../models/Order");
const User = require("../models/User");
const sequelize = require("../config/database");


const mode =
    process.env.CASHFREE_MODE === "production"
        ? Cashfree.PRODUCTION
        : Cashfree.SANDBOX;

const cashfree = new Cashfree(
    mode,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
);


// CREATE ORDER
const createPaymentOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const amount = Number(process.env.PREMIUM_AMOUNT || 499);

        const orderId = `premium_${userId}_${Date.now()}`;


        // 1. Create our own order as PENDING
        const order = await Order.create({
            orderId,
            amount,
            status: "PENDING",
            userId
        },
        {
            transaction
        });

        // 2. Create order at Cashfree
        const request = {
            order_amount: amount,

            order_currency: "INR",

            order_id: orderId,

            customer_details: {
                customer_id: String(user.id),
                customer_name: user.name,
                customer_email: user.email,

                // For sandbox testing
                customer_phone: "9999999999"
            },

            order_meta: {
                return_url:
                    `${process.env.FRONTEND_URL}/payment-result.html?order_id={order_id}`
            },

            order_note: "Premium Membership"
        };

        const response = await cashfree.PGCreateOrder(request);

        const cashfreeOrder = response.data;

        // 3. Save Cashfree information
        await order.update({
            cfOrderId: cashfreeOrder.cf_order_id,
            paymentSessionId: cashfreeOrder.payment_session_id
        });

        res.status(200).json({
            message: "Order created",
            orderId: orderId,
            paymentSessionId: cashfreeOrder.payment_session_id
        });
        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        console.log(
            "Create payment order error:",
            error.response?.data || error.message
        );

        // If Cashfree order creation failed,
        // our local PENDING order should become FAILED.
        if (req.user?.id) {
            // We can identify the order from the generated ID
            // when available.
        }

        res.status(500).json({
            message: "Unable to create payment order"
        });
    }
};


// CHECK PAYMENT STATUS
const getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            where: {
                orderId,
                userId: req.user.id
            }
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        /*
         IMPORTANT:

         Latest Cashfree SDK:
         
         cashfree.PGOrderFetchPayments(orderId)

         Do NOT pass a date string.
        */

        const response =
            await cashfree.PGOrderFetchPayments(orderId);

        const payments = response.data || [];

        const successfulPayment = payments.find(
            payment =>
                payment.payment_status === "SUCCESS"
        );

        const failedPayment = payments.find(
            payment =>
                payment.payment_status === "FAILED"
        );


        // PAYMENT SUCCESS
        if (successfulPayment) {

            await order.update({
                status: "PAID"
            },
        {
            transaction
        });
            
            await User.update(
        {
            isPremium: true
        },
        {
            where: {
                id: req.user.id
            },
        
            transaction
        
        }
    );

     

            return res.status(200).json({
                orderId,
                status: "PAID",
                message: "Transaction successful"
            });
        }
        //await transaction.commit();

        // PAYMENT FAILED
        if (failedPayment) {

            await order.update({
                status: "FAILED"
            });

            return res.status(200).json({
                orderId,
                status: "FAILED",
                message: "TRANSACTION FAILED"
            });
        }
        

        // Still pending
        return res.status(200).json({
            orderId,
            status: "PENDING",
            message: "Payment is still pending"
        });
        

    } catch (error) {
        //await transaction.rollback();
        console.log(
            "Payment status error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Unable to verify payment status"
        });
    }
};


module.exports = {
    createPaymentOrder,
    getPaymentStatus
};