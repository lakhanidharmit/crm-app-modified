const userController = require('../controllers/user.controller')
const {authJwt} = require('../middlewares')

module.exports = (app)=>{
    app.get("/crm/api/v2/users", [authJwt.verifyToken, authJwt.isAdmin], userController.findAll)
    app.get("/crm/api/v2/users/:Id", [authJwt.verifyToken, authJwt.isValidUserIdInReqParam, authJwt.isAdminOrOwner], userController.findByUserId)
    app.put("/crm/api/v2/users/:Id", [authJwt.verifyToken, authJwt.isValidUserIdInReqParam, authJwt.isAdminOrOwner], userController.update)
}