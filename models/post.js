const mongoose = require('mongoose');

const DataSchema = mongoose.Schema({
    userid :    {   type:   String  },
    category :    {   type:   String  },
    title :     {   type:   String  },
    content :   {   type:   String  },
    postImage : {   type:   String  },
    comments :  {   type:   Array   },
    upvotes:    {   type:   Number,default:0 }
});

const Post = module.exports = mongoose.model('Post',DataSchema);
