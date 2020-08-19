const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        unique: true
    },
    imageURL:{
        type: String,
        unique: true
    },
    audioURL: {
        type: String,
        unique: false
    }
    //"itemId" : {type: String, index: {unique: true}}
});

//module.exports = mongoose.model('Item', itemSchema);



var CatalogItem = mongoose.model('Item', itemSchema);

module.exports = {CatalogItem : CatalogItem, connection : mongoose.connection};

 
   