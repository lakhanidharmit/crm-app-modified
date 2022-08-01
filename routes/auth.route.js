const authController = require('../controllers/auth.controller')
const {verifySignUp} = require('../middlewares')

module.exports = (app)=>{
    app.post("/crm/api/v2/auth/signup", [verifySignUp.validateSignUpRequestBody], authController.signup)
    app.post("/crm/api/v2/auth/signin", [verifySignUp.validateSignInRequestBody], authController.signin)
}