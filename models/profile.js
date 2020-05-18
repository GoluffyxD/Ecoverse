const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
    userid :        {   type:   String },
    username :      {   type:   String },
    email :         {   type:   String },
    gender :        {   type:   String },
    following :     {   type:   Array  },
    upvotes:        {   type:   Array   },
    userimage:      {   type:   String, default:"/pictures/default.png"}
});

module.exports = mongoose.model('Profile',ProfileSchema);