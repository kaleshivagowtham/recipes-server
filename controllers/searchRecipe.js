const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/recipe');

const search = express();

search.post('/search', async (req, res) => {

    try {
        const searchText = req.body.searchText;

        const searchResult = await Recipe.find({
                $or: [
                    {title : {$regex : searchText, $options : 'i'}},
                    { tags: { $regex : searchText, $options : 'i'} },
                    { ingredients: {$regex : searchText, $options : 'i'} }
                ],
            })
        .then (searchResult => {
            if(searchResult)
                return res.status(200).json(searchResult);
            else
                return res.status(200).json({message : "There was an error"});    
        })
        .catch(err => {
            return res.status(200).json({message : "There was an error"});
        })
    }
    catch(err) {
        // console.log(err);
        return res.status(400).json({"error" : err.message})
    }
})

module.exports = search;