const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const fs=require('fs');
const path = require('path');
const Profile = require('../models/profile');
const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename: function(req,file,cb){
        cb(null,req.body.title+'_'+file.originalname);
        //console.log(file.originalname);
      }
});

// const fileFilter= (req,file,cb) =>{
//     console.log(file);
//     if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || !file.mimetype)
//     {
//         cb(null,true);
//     }
//     else{
//         cb(null,false);
//     }
// };

const upload = multer({
    storage:storage,
    // fileFilter:fileFilter
    });

const Post = require('../models/post')

router.get('/viewall',(req,res,next)=>{
    Post.find({},(err,posts)=>{
        res.send(posts);
    })
})

router.get('/wallposts',checkAuth,(req,res,next)=>{
    Profile.find({userid:req.userData.userId},{following:1})
    .exec()
    .then(follow=>{
        console.log(req.userData.userId);
        console.log(follow[0]["following"]);
        Post.find({userid:follow[0]["following"]},(err,posts)=>{
            res.json(posts);
        });
    })
})


router.post('/viewposts',(req,res,next)=>{
    Post.find({userid:req.body.posts},(err,posts)=>{
        res.send(posts);
    })
})


router.get('/posts',checkAuth,(req,res,next)=>{
    console.log(req.userData);
    Post.find({userid:req.userData.userId},(err,posts)=>{
        res.json(posts);
    });
});


router.post('/post',checkAuth,upload.single('postImage'),(req,res,next)=>{
    let path;
    if(req.file){
        path='/'+req.file.path;
    }
    else{
        console.log(req.file);
        // return res.json({err:2});
    }
    let newPost = Post({
        userid : req.userData.userId,
        category : req.body.category,
        title : req.body.title,
        content : req.body.content,
        postImage : path
    });
    newPost.save((err,post)=>{
        if(err){
            res.json({err:1})
        }
        else{
            res.json({err:0})
        }
    })
});



router.post('/addcomment',checkAuth,(req,res,next)=>{
    userid=req.userData.userId;
    comment={by:userid,content:req.body.comment}
    Post.findByIdAndUpdate(req.body._id,{$push:{comments:comment}},{upsert:true},(err,post)=>{
        if(err){
            return res.send(err);
        }
        res.send(post);
    })
});



router.post('/explore',checkAuth,(req,res,next)=>{
    Post.find({category:req.body.category},(err,result)=>{
        if(err)
            res.json(err);
        res.json(result);
    })
});




router.post('/upvote',checkAuth,(req,res,next)=>{
    console.log(req.userData.userId);
    Profile.find({userid:req.userData.userId},{upvotes:1,_id:0}).exec()
    .then(upvotearr=>{
        let arr=upvotearr[0]["upvotes"];
        for(var i=0;i<arr.length;i++){
            if(arr[i]==req.body._id){
                return res.json({upvoted:-1});
            }
        }
        console.log(upvotearr);
        Post.findByIdAndUpdate(req.body._id,{$inc:{upvotes:1}},(err,post)=>{
            if(err){
                return res.send(err);
            }
            else{
        //res.send(post);
            Profile.findOneAndUpdate({userid:req.userData.userId},{$push:{upvotes:req.body._id}},{upsert:true},(err,result)=>{
                if(err)
                    return res.send(err);
                res.json({upvoted:1});
            })
        }
        });
    })
})


router.post('/cancelupvote',checkAuth,(req,res,next)=>{
    Profile.findOneAndUpdate({userid:req.userData.userId},{$pullAll:{upvotes:[req.body._id]}}).exec()
    .then(
        Post.findByIdAndUpdate(req.body._id,{$inc:{upvotes:-1}},(err,post)=>{
            if(err)
                return res.json(err);
            return res.json({cancel:1});
        })
    )
    .catch(err=>{
        return res.json(err);
    })
})


router.delete('/clearall',(req,res,next)=>{
    Post.remove({},(err,result)=>{
        if(err){
            res.json({msg:"error in deleting"})
        }
        else{
            res.json({msg:"Deletion done"})
        }
    });
    const directory='./uploads';
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      });
})

router.post('/deletepost',(req,res,next)=>{
    console.log(req.body.deleteid);
    console.log(req.body.deleteimg);
    Post.remove({_id:req.body.deleteid},(err,result)=>{
                if(err){
                res.json({deleted:-1})
                }
                else{
                    res.json({deleted:1})
                }
            });
    if(req.body.deleteimg){
        const directory='./uploads';
        fs.unlink(path.join(directory,req.body.deleteimg),err=>{
            if(err) throw err;
        });
    }
})

module.exports = router;