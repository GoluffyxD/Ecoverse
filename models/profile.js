const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
    userid :        {   type:   String },
    username :      {   type:   String },
    email :         {   type:   String },
    gender :        {   type:   String },
    following :     {   type:   Array  },
    upvotes:        {   type:   Array   },
    userimage:      {   type:   String, default:"http://localhost:3000/pictures/default.png"}
});

module.exports = mongoose.model('Profile',ProfileSchema);