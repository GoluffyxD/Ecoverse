const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken')
const User = require('../models/user');
const Profile=require('../models/profile');
const dotenv=require('dotenv')
dotenv.config();


router.get('/list',(req,res,next)=>{
    User.find({}).exec().then(result=>{
        res.json(result);
    })
});

router.post('/getinfo',(req,res,next)=>{
    arr=req.body.ids;
    console.log(arr);
    Profile.find({userid:arr},{userid:1,email:1,username:1,userimage:1,_id:0},(err,result)=>{
        if(err)
            return res.send({msg:"Error"});
        return res.json(result);
    })
})

router.post('/signup',(req,res,next)=>{
    let flag=0;
    User.find({email:req.body.email})
    .exec()
    .then(user => {
        if(user.length>=1)
        {
            return res.status(409).json({msg:"User already exists"});
        }
        else
        {
            Profile.find({username:req.body.username}).exec()
            .then(profile=>{
                if(profile.length>=1){
                    return res.status(409).json({msg:"Username taken"});
                }
            else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({error:err})
                }
                else{
                    const user = new User({
                        email: req.body.email,
                        password:hash
                    })
                    user.save((err,user_ret)=>{
                        if(err){
                            return res.status(401).json({msg:"Error creating user"}); 
                        }
                        else{
                            flag=1;
                            res.json({msg:"User created successfully"})
                            console.log(user_ret);
                            const profile=new Profile({
                                userid:user_ret._id,
                                username:req.body.username,
                                email:req.body.email,
                                gender:req.body.gender,
                                following:''
                            });
                            profile.save((err,profile)=>{
                                if(err){
                                    console.log(User.find({email:req.body.email},{_id:1}))
                                    console.log("error");
                                    console.log(this.profile);
                                }
                                else{
                                    //Do nothing
                                }
                            });
                        }
                    })
                    console.log('Here');
                    console.log("reached here");
                    

                }
            })
        }
        })
        }
    })
    .catch()
})

router.post('/login',(req,res,next)=>{
    User.find({email:req.body.email}).exec()
    .then(user=>{
        if(user.length<1){
            return res.status(401).json({msg:"Auth Failed"});
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if (err){
                return res.status(401).json({msg:"Auth Failed"});
            }
            if(result){
                const token=jwt.sign(
                    {
                        email:user[0].email,
                        userId:user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn:"2h"
                    }
                );
                return res.status(200).json({
                    msg:"Auth successful",
                    token:token,
                    expiresIn: 7200
                });
            }
            return res.status(401).json({msg:"Auth Failed"});
        })
    })

})

router.delete('/:userId',(req,res,next)=>{
    User.remove({_id:req.params.userId}).exec()
    .then(result=>{
        res.status(200).json({msg:"User Deleted"})
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
});

module.exports = router;