const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const multer = require('multer');
const fs=require('fs');
const path = require('path');
const Profile=require('../models/profile');
const checkAuth = require('../middleware/check-auth');

const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./pictures/');
    },
    filename: function(req,file,cb){
        //console.log(req.body.author);
        cb(null,file.originalname);
        //console.log(file.originalname);
      }
});

const upload = multer({storage:storage});

router.get('/viewall',(req,res,next)=>{
    Profile.find({},(err,profiles)=>{
        res.send(profiles);
    })
})

router.get('/getupvotes',checkAuth,(req,res,next)=>{
    Profile.find({userid:req.userData.userId},{upvotes:1},(err,result)=>{
        if(err)
            return res.json(err);
        res.json(result);
    })
})
router.get('/basicinfo',checkAuth,(req,res,next)=>{
    Profile.find({userid:req.userData.userId},{userid:1,email:1,username:1,_id:0},(err,result)=>{
        if(err)
            return res.send(err);
        return res.json(result);
    });
});

router.post('/changedp',checkAuth,upload.single('newImage'),(req,res,next)=>{
    let path;
    if(req.file){
        path='http://localhost:8080/'+req.file.path;
    }
    else{
        console.log("Hmmm")
        //path='';
    }
    Profile.findOneAndUpdate({userid:req.userData.userId},{userimage:path},(err,result)=>{
        if(err)
            return res.json({updated:-1});
        res.json({updated:1});
    })
});


router.post('/follow',checkAuth,(req,res,next)=>{
    Profile.find({userid:req.userData.userId},{following:1}).exec()
    .then(follow=>{
        arr=follow[0]["following"];
        //console.log(arr);
        //console.log("1;",req.body.follows);
        if(arr.includes(req.body.follows))
        {
            return res.send({msg:"You already follow this user!"});
        }
        else{
        Profile.findOneAndUpdate({userid:req.userData.userId},{$push:{following:req.body.follows}},{upsert:true},(err,posts)=>{
            if(err)
                return res.send(err);
            res.send({msg:"Updation done"})
        });
    }
    });
})

router.post('/unfollow',checkAuth,(req,res,next)=>{
    Profile.findOneAndUpdate({userid:req.userData.userId},{$pullAll:{following:[req.body.unfollowid]}},(err,result)=>{
        if(err)
            res.send(err);
        res.json({unfollowed:1});
    })
})
router.post('/viewuser',(req,res,next)=>{
    Profile.find({username:req.body.query}).exec()
    .then(pro=>{
        if(pro.length>=1){
            return res.send(pro);
        }
        else{
            Profile.find({email:req.body.query},(err,profile)=>{
                if(profile.length<1){
                    return res.status(404).send({msg:"User does not exist",err:1});
                }
        res.send(profile);
    })
    }
    })
})
router.get('/profileget',checkAuth,(req,res,next)=>{
    Profile.find({userid:req.userData.userId},(err,profile)=>{
        res.json(profile);
});
})

router.post('/addprofile',checkAuth,(req,res,next)=>{
    let newProfile=Profile({
        userid:req.userData.userId,
        username:req.body.username,
        email:req.body.email,
        gender:req.body.gender,
        following:''
    });
    newProfile.save((err,result)=>{
        if(err){
            res.json({msg:"Error adding Profile"})
        }
        else{
            res.json({msg:"Profile added Successfully"})
        }
    });
})

router.delete('/:userId',(req,res,next)=>{
    Profile.remove({userid:req.params.userId}).exec()
    .then(result=>{
        res.status(200).json({msg:"User Profile Deleted"})
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
});

module.exports = router;