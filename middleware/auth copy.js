const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {

    try {
        const token = req.body.token
        if (!token)
            return res.status(401).json({ authorized: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
            if (err) {
                return res.status(401).json({ authorized: false, err : err })
            } else {
            const user = await User.findById(data.id)
            if (user) 
                return res.status(200).json({ authorized: true, user: user })
            else 
                return res.status(401).json({ authorized: false })
            }
        })
        next();
    }
    catch(err) {
        return res.status(500).json({error : err});
    }
}
