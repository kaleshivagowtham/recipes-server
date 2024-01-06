const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { userVerification } = require('./middleware/auth');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.mongooseUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
mongoose.connection.on('connected' , () => {
    console.log("Db connected successfully");
})
mongoose.connection.on('error' , (err) => {
    console.log("Error ocurred :",err);
})

app.use(require('./controllers/authentication'));
app.use(require('./controllers/recipes'));
app.use(require('./controllers/myrecipes'));
app.use(require('./controllers/searchRecipe'));

app.get('/' , (req, res) => {
    try {
        return res.status(200).json({message : "Server is live"});
    }
    catch(err) {
        return res.status(200).json({message : err.message});
    }
})

app.post('/', async (req, res) => {

    try {
        const token = JSON.parse(req.body.token);

        if (!token)
            return res.status(200).json({ authorized: false })
        if(token) {
            jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
                if (err) {
                    return res.status(200).json({ authorized: false, err : err })
                } else {
                const user = await User.findById(data.id);
                if (user) {
                    // console.log(user);
                    return res.status(200).json({authorized:true ,user: user})
                }
                else 
                    return res.status(200).json({ authorized: false })
                }
            })
        }
    }
    catch(err) {
        return res.status(200).json({error : err});
    }
});


app.listen(process.env.PORT || 5000, () => {
    console.log(`server started on PORT no: ${process.env.PORT || 5000}`);
})