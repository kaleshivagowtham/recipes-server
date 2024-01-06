const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const {userVerification} = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const recipes = express();

recipes.post('/getwriterrecipes', async (req, res) => {

    try {
        const writerId = req.body.writerId;

        const recipes = await Recipe.find({writtenBy : writerId});
        if(recipes) 
            return res.status(200).json(recipes);
        else
            return res.status(200).json({message : "There seems to be some error"});
    }
    catch(err) {
        // console.log(err.message);
        return res.status(200).json({"error" : err.message});
    }
})

recipes.post('/checkifwriter' , (req, res) => {

    try {
        const writerId = req.body.writtenBy;
        const token = JSON.parse(req.body.token);
        if (!token)
            res.status(200).json({ authorized: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {

            if (err)
                res.status(200).json({err : err.message })
            else {
                if( data.id === writerId)
                    return res.status(200).json({isWriter : true})
                else
                    return res.status(200).json({isWriter : false})
            }
        })
    }
    catch (err) {
        return res.status(200).json({"error" : err.message});
    }
})

module.exports = recipes;