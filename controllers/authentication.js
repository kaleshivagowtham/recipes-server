const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.js');
require('dotenv').config();
const bcrypt = require('bcrypt');
const {createSecretToken} = require('../utils/secretKey.js');

const authentication = express();

authentication.post('/signup' , (req, res) => {

    const {name, email, password, profilePic} = req.body.signupCreds;

    User.findOne({email : email})
    .then(savedUser => {
        if(savedUser)
            return res.status(200).json({"message" :"Email already registered"});
        const user = new User({
            name : name,
            email : email,
            password : password,
            profilePic
        })
        user.save().then (saved => {
            if(!saved)
                return res.status(200).json({message : "Some error ocurred"});
            const token = createSecretToken(user._id);
            return res.status(200).json({message : "Signin successful", user : user, token : token});
        })
        .catch(err => {
            return res.status(200).json({message : "There was an error"});
        })
    })
})

authentication.post('/login' , async (req, res) => {

    const {email, password} = req.body.loginCreds;
    // console.log(email," ",password);

    await User.findOne({email : email, password : password})
    .then(savedUser => {
        if(savedUser) {
            const token = createSecretToken(savedUser._id);
            return res.status(200).json({message :"Login successful", savedUser : savedUser, token: token});
        }
        return res.status(200).json("Login unsuccessful");
    })
    .catch(err => {
        return res.status(200).json({message : "There was an error"});
    })
})

module.exports = authentication;