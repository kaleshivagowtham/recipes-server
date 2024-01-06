const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = async (req, res, next) => {

    try {
        const token = req.body.token
        if (!token)
            res.status(401).json({ authorized: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
            if (err) {
                res.status(401).json({ authorized: false, err : err })
            } else {
            const user = await User.findById(data.id)
            if (user) {
                req.authorized = true;
                req.user = user;
                // console.log(req.authorized," printing ",req.user);
                next();
            }
            else 
                res.status(401).json({ authorized: false })
            }
        })
        next();
    }
    catch(err) {
        res.status(500).json({error : err});
    }
}
