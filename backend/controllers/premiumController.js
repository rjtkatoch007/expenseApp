const User = require("../models/User");

const showLeaderboard = async (req, res) => {

     try {

        const users = await User.findAll({
            attributes: ["id", "name", "totalexpenses"],
            order: [["totalexpenses", "DESC"]]
        });

        res.status(200).json(users);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Unable to fetch leaderboard"
        });
    }
   
 };


module.exports = {
    showLeaderboard
};