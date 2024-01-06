const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/recipe');

const search = express();

search.post('/search', async (req, res) => {

    try {
        const searchText = req.body.searchText;

        const searchResult = await Recipe.find({
                $or: [
                    { tags: { $in: [searchText] } },
                    { ingredients: { $in: [searchText] } },
                ],
            });
        if(searchResult)
            return res.status(200).json(searchResult);
    }
    catch(err) {
        // console.log(err);
        return res.status(400).json({"error" : err.message})
    }
})

module.exports = search;