const jwt = require('jsonwebtoken');
const authConfig = require('../configs/auth.config')
const User = require('../models/user.model')
const constants = require('../utils/constants')


const verifyToken = (req,res,next)=>{
    const token = req.headers["x-access-token"];

    if(!token){
        return res.status(403).send({
            message : "no token provided! Access prohibited"
        })
    }

    jwt.verify(token, authConfig.secret, async (err, decoded)=>{
        if(err){
            return res.status(401).send({
                message : "UnAuthorised!"
            })
        }
        const user = await User.findOne({userId : decoded.id});
        req.user = user;
        next();
    })
}

const isAdmin = (req,res,next)=>{
    const user = req.user
    if (user && user.userType == constants.userType.admin){
        req.user.isAdmin = true;
        next();
    }else{
        return res.status(403).send({
            message : "only ADMIN users are allowed to access this endpoint"
        })
    }
}

const isValidUserIdInReqParam = async (req,res,next)=>{
    try{
        const user = await User.find({userId : req.params.Id});
        if(!user){
            return res.status(400).send({
                message : "userId passed dosen't exist"
            })
        }
        next();
    }catch(err){
        console.log("#### Error while reading the user info #### ", err.message);
        return res.status(500).send({
            message : "Internal server error while reading the user data"
        })
    }
}

const isAdminOrOwner = (req,res,next)=>{
    try {
        const callingUser = req.user;
        if(callingUser.userType == constants.userType.admin){
            req.user.isAdmin = true;
            next();
        }else if(callingUser.userId == req.params.userId){
            next();
        }else{
            return res.send(403).send({
                message : "Only admin or owner is allowed to make this call"
            })
        }
    }catch(err){
        console.log("#### Error while reading the user info #### ", err.message);
        return res.status(500).send({
            message : "Internal server error while reading the user data"
        })
    }

}

const authJwt = {
    verifyToken : verifyToken,
    isAdmin : isAdmin,
    isValidUserIdInReqParam : isValidUserIdInReqParam,
    isAdminOrOwner : isAdminOrOwner
}

module.exports = authJwt