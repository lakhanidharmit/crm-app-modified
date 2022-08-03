require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model')
const constants = require('../utils/constants')
const authConfig = require('../configs/auth.config');
const sendVerificationEmail = require('../utils/sendVerificationEmail')

const isValidEmail = (email)=>{
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

const isValidPassword = (password)=>{
    return password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{10,25}$/);
}


const validateSignUpRequestBody = async (req,res,next)=>{
    if(!req.body.name){
        return res.status(400).send({
            message : "Failed! User name is not provided"
        })
    }

    if(!req.body.userId){
        return res.status(400).send({
            message : "Failed! UserId is not provided"
    })
    }

    try{
        const user = await User.findOne({userId: req.body.userId});
        if(user!=null){
            return res.status(400).send({
                message : "Failed! userId is already taken"
            })
        }
    }catch(err){
        return res.status(500).send({
            message : "Internal server error while validating the request"
        })
    }

    if(!req.body.password){
        return res.status(400).send({
            message : "Failed! Password is not provided"
        })
    }

    if(!isValidPassword(req.body.password)){
        return res.status(400).send({
            message : "Failed! Not a valid password. Password must be 10 to 25 characters containing at least one lowercase letter, one uppercase letter, one numeric digit, and one special character"
        })
    }

    if(!req.body.email){
        return res.status(400).send({
            message : "Failed! Email is not provided"
        })
    }

    if(!isValidEmail(req.body.email)){
        return res.status(400).send({
            message : "Failed! Not a valid email id"
        })
    }

    if(!req.body.userType){
        return res.status(400).send({
            message : "Failed! User type is not provided"
        })
    }

    if(req.body.userType == constants.userType.admin){
        return res.status(400).send({
            message : "ADMIN registration is not allowed"
        })
    }

    const userTypes = [constants.userType.customer, constants.userType.engineer];

    if(!userTypes.includes(req.body.userType)){
        return res.status(400).send({
            message : "UserType provided is not correct. Possible correct values : CUSTOMER | ENGINEER"
        })
    }

    next();
}

const validateSignInRequestBody = (req, res, next) => {
    
    if (!req.body.userId) {
        return res.status(400).send({
            message: "Failed ! UserId is not provided"
        })
    }

    if (!req.body.password) {
        return res.status(400).send({
            message: "Failed ! Password is not provided"
        })
    }

    next();
}


const verifyEmailToken = (req,res,next)=>{

    const token = req.params.token;

    jwt.verify(token, authConfig.secret, async (err, decoded)=>{
        if(err){
            return res.status(401).send({
                message : "The link is not valid!"
            })
        }

        req.user = await User.findOne({_id : decoded.id});

        if(req.user){
            const dateNow = new Date();
            const tokenLife = (decoded.iat + process.env.EMAIL_TOKEN_TIME*60) * 1000;
            console.log(tokenLife);
            console.log(dateNow.getTime());
            
            if(tokenLife<dateNow.getTime()){
                console.log("token expired");
                sendVerificationEmail(req.user);
                return res.status(401).send({
                    message : "This link has expired. A new link has been sent to your email address."
                })
            }
            console.log("to next");
            next();
            
        }else{
            return res.status(401).send({
                message : "User not found"
            })
        }
    })
}

const verifyRequestBodiesForAuth = {
    validateSignUpRequestBody : validateSignUpRequestBody ,
    validateSignInRequestBody : validateSignInRequestBody,
    verifyEmailToken : verifyEmailToken
};

module.exports = verifyRequestBodiesForAuth