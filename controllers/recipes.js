const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const {userVerification} = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const recipes = express();

recipes.get('/getallrecipe' , async (req, res) => {

    try {
        await Recipe.find().limit(10).select('-_id')
        .then(recipes => {
            if(recipes)
                return res.status(200).json(recipes);
            else
                return res.status(200).json({message : "There seems to be an error"});
        })
        .catch(err => {
            return res.status(200).json({message : "there was an error"});
        })
        // console.log("recipes : ",recipes);
        // if(recipes)
        //     return res.status(200).json(recipes);
        // else
        //     return res.status(200).json({message : "There seems to be an error"});
    }
    catch(err) {
        return res.status(200).json({message : "there was an error"});
    }
})

recipes.post('/getrecipe', async (req, res) => {
    
    try {
        const {recipeTitle} = req.body;
        const savedRecipe = await Recipe.findOne({title : recipeTitle.replace(/-/g,' ')}).select('-_id -writtenBy')
        .then(savedRecipe => {
            if(savedRecipe)
                return res.status(200).json(savedRecipe);
            else
                return res.status(200).json({message : "Unable to fetch at the moment"});
        })
        .catch(err => {
            return res.status(200).json({message : err.message});
        })
    }
    catch(err) {
        // console.log(err.message);
        return res.status(200).json({message : err.message});
    }
});

recipes.post('/addrecipe', async (req, res) => {

    try {
        const {title, titleImg, paras, tags, ingredients, likedBy} = req.body.newRecipe;

        const token = JSON.parse(req.body.token);
        if (!token)
            return res.status(200).json({ authorized: false });

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {

            if (err){
                console.log(err.message);
                return res.status(200).json({err : err.message })
            }

            else {
                console.log(data.id);
                const user = await User.findById(data.id);
                if (user) {
                    const newRecipe = new Recipe({
                        writtenBy : data.id,
                        authorName : user.name,
                        title : title,
                        titleImg : titleImg,
                        paras : paras,
                        tags : tags,
                        ingredients : ingredients,
                        likedBy : likedBy,
                        createdOn : Date.now()
                    })

                    newRecipe.save()
                    .then(saved => {
                        if(!saved)
                            return res.status(200).json({message : "There has been some issue"});
                        return res.status(200).json({message:"Recipe saved", id : saved._id});
                    })
                    .catch(err => {
                        return res.status(200).json({message:"There seems to be an error"});
                    })
                }
                else 
                    return res.status(200).json({ message: "User not found" });
            }
        })
    }
    catch(err) {
        // console.log(err.message);
        return res.status(200).json({"error" : err.message});
    }
})

recipes.delete('/deleterecipe' , async (req, res) => {

    try {

        const {recipeTitle} = req.body;

        const token = JSON.parse(req.body.token);
        if (!token)
            return res.status(200).json({ authorized: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {

            if (err)
                return res.status(200).json({err : err.message })

            else {
                await Recipe.findById(id)
                .then(savedRecipe => {
                    if(savedRecipe.writtenBy != data.id)
                        return res.status(200).json({authorized : false,message : "Unauthorized request"})

                    Recipe.deleteOne({_id : id})
                    .then(() => {
                        return res.status(200).json({message : "Recipe deleted"})
                    })
                })
                .catch(err => {
                    return res.status(200).json({message : "There was an error"});
                })
            }
        })
    }
    catch(err) {
        // console.log(err.message);
        return res.status(200).json({message : "There seems to be an error"})
    }
})

recipes.put('/updaterecipe', async (req, res) => {

    try {
        const { _id, title, titleImg, paras, tags, ingredients} = req.body.updateRecipe;
        const token = JSON.parse(req.body.token);
        if (!token)
            return res.status(201).json({ authorized: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {

            if (err)
                res.status(201).json({err : err.message })

            else {
                await Recipe.findById(_id)
                .then(savedRecipe => {
                    if(savedRecipe.writtenBy != data.id)
                        return res.status(200).json({authorized : false,message : "Unauthorized request"})
                    const deleteImgUrl = savedRecipe.titleImg;
                    Recipe.updateOne({_id : _id}, {
                        title,
                        paras,
                        tags,
                        titleImg,
                        ingredients
                    })
                    .then(() => {
                        return res.status(200).json({message : "Recipe updated", deleteImgUrl})
                    })
                    .catch(err => {
                        return res.status(200).json({message : "There was an error"});
                    })
                })
            }
        })
    }
    catch(err) {
        // console.log(err.message);
        return res.status(200).json({"error" : err.message});
    }
})

recipes.post('/checkliked' , async (req, res) => {
    try {
        const recipeId = req.body.recipeId;

        const token = JSON.parse(req.body.token);
        if (!token)
            return res.status(200).json({ likedByMe: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
            if (err)
                res.status(200).json({err : err.message })

            else {
                const user = await User.findById(data.id);
                if(user) {
                    if(user.likedByMe.indexOf(recipeId) > -1)
                        return res.status(200).json({likedByMe : true})
                    else
                        return res.status(200).json({likedByMe : false})
                }
                else
                    return res.status(200).json({likedByMe : false});
            }
        })
    }
    catch(err) {
        // console.log("ERROR : ",err.message);
        return res.status(200).json({"error" : err.message});
    }
})

recipes.post('/changeliked' , async (req, res) => {
    try {
        const recipeId = req.body.recipeId;

        const token = JSON.parse(req.body.token);
        if (!token)
            return res.status(200).json({ likedByMe: false })

        jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
            if (err)
                res.status(200).json({err : err.message })

            else {
                const user = await User.findById(data.id);
                if(user) {
                    if(user.likedByMe.indexOf(recipeId) > -1){
                        console.log("Will dislike");
                        Recipe.findByIdAndUpdate(recipeId , {$pull : {likedBy : data.id}}, {new : true})
                        .then(updatedRecipe => {
                            User.findByIdAndUpdate(data.id , {$pull : {likedByMe : recipeId}}, {new : true})
                            .then(updatedUser => {
                                return res.status(200).json({likedByMe : false});
                            })
                            .catch(err => {
                                return res.status(200).json({message : "There was an error"});
                            })
                        })
                        .catch(err => {
                            return res.status(200).json({message : "There was an error"});
                        })
                    }
                    else {
                        console.log("Will Like");
                        Recipe.findByIdAndUpdate(recipeId , {$push : {likedBy : data.id}}, {new : true})
                        .then(updatedRecipe => {
                            User.findByIdAndUpdate(data.id , {$push : {likedByMe : recipeId}}, {new : true})
                            .then(updatedUser => {
                                return res.status(200).json({likedByMe : true});
                            })
                        })
                        .catch(err => {
                            return res.status(200).json({message : "There was an error"});
                        })
                    }
                }
                else
                    return res.status(200).json({likedByMe : false});
            }
        })
    }
    catch(err) {
        // console.log("ERROR : ",err.message);
        return res.status(200).json({"error" : err.message});
    }
})

module.exports = recipes;