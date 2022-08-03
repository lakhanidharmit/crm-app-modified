require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model')
const jwt = require('jsonwebtoken');
const authConfig = require('../configs/auth.config');
const constants = require('../utils/constants');
const sendVerificationEmail = require('../utils/sendVerificationEmail')


exports.signup = async (req,res)=>{

    const userObj = {
        name : req.body.name,
        userId : req.body.userId,
        email : req.body.email,
        userType : req.body.userType,
        password : bcrypt.hashSync(req.body.password, 8),
        userStatus : constants.userStatus.pending
    };

    try{
        const userCreated = await User.create(userObj);
        
        sendVerificationEmail(userCreated);

        const response = {
            name : userCreated.name,
            userId : userCreated.userId,
            email : userCreated.email,
            userType : userCreated.userType,
            userStatus : userCreated.userStatus,
            createdAt : userCreated.createdAt,
            updatedAt : userCreated.updatedAt
        }


        console.log(`#### ${response.userType} ${response.name} created ####`);
        res.status(201).send(response);
    }catch(err){
        console.log("#### error while user sign up #### ", err.message);
        res.status(500).send({
            message : "Internal server error while creating user"
        });
    }
}

exports.signin = async (req,res)=>{
    try{
        const user = await User.findOne({userId : req.body.userId})
        if(user == null){
            return res.status(400).send({
                message : "Failed! userId passed dosen't exist"
            });
        }
        
        if(!user.emailVerified){
            return res.status(400).send({
                message : "Failed! user is not verified yet"
            });
        }

        if(user.userStatus == constants.userStatus.pending){
            return res.status(400).send({
                message : "User is not yet approved from the admin"
            })
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if(!passwordIsValid){
            return res.status(401).send({
                message : "Wrong password"
            });
        }

        const token = jwt.sign({id: user.userId}, authConfig.secret, {expiresIn : 86400}); // 24 hours
        console.log(`#### ${user.userType} ${user.name} logged in ####`);

        res.status(200).send({
            name : user.name,
            userId : user.userId,
            email : user.email,
            userType : user.userType,
            userStatus : user.userStatus,
            accesToken : token
        });
    }catch(err){
        console.log("#### Error while user sign in ##### ", err.message);
        res.status(500).send({
            message : "Internal server error while user signin"
        });
    }
}

exports.verifyUserEmail = async (req,res)=>{
    try{
        if(req.user.userType==constants.userType.customer){
            req.user.userStatus = constants.userStatus.approved;
        }
        req.user.emailVerified = true;
        req.user.save()
        console.log(`#### ${req.user.userType} ${req.user.name} is verified ####`);
        res.status(200).send({
            message : "Email verification successful;"
        })
}catch(err){
        console.log("#### Error while verifying user email ##### ", err.message);
        res.status(500).send({
            message : "Internal server error while email verification"
        });
    }
}