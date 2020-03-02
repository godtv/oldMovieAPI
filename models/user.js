'use strict';

const mongoose = require('mongoose'),
    { Schema } = mongoose,
    passportLocalMongoose = require('passport-local-mongoose');

let userSchme = new Schema({
    name: {
        first: {
            type: String,
            trim: true
        },
        last: {
            type: String,
            trim: true
        },
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    role: {
      type: String,
      required: false
    },
    oldmovie:[{
        type: Schema.Types.ObjectId,
        //ref: 'oldmovie'
        ref: 'Movie'
    }],
    favoriteItem:[{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
}, {
    timestamps: true
});

userSchme.virtual('fullName')
    .get(function () {
       return `${this.name.first} ${this.name.last}`;
    });

userSchme.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

module.exports = mongoose.model( 'User', userSchme );





