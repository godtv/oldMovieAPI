const mongoose = require('mongoose');


const oldMovieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    albumArt: { //這是圖像
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: [0, "too low"],
        max: 100
    }
});

module.exports = mongoose.model('Movie', oldMovieSchema);



  

 