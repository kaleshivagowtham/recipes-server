const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({

    writtenBy : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
    },
    title : {
        type : String,
        required : true
    },
    titleImg : {
        type : String,
    },
    paras : {
        type : String,
        required : true
    },
    tags : [String],
    ingredients : [String],
    likedBy : [String],
    createdOn : {
        type : Date,
        required : true
    }
})

module.exports = mongoose.model("Recipe", recipeSchema);