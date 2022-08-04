const authController = require('../controllers/auth.controller')
const {verifySignUp, authJwt} = require('../middlewares')

module.exports = (app)=>{
    app.post("/crm/api/v2/auth/signup", [verifySignUp.validateSignUpRequestBody], authController.signup)
    app.post("/crm/api/v2/auth/signin", [verifySignUp.validateSignInRequestBody], authController.signin)
    app.get("/crm/api/v2/auth/verifyemail/:token", [verifySignUp.verifyLinkToken], authController.verifyUserEmail)
    app.get("/crm/api/v2/auth/resendverificationemail/:token", [authJwt.isValidUserIdInReqParam], authController.resendVerificationEmail)
}