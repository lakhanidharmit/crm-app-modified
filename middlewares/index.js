const verifySignUp = require('./verifySignUp')
const authJwt = require('./authjwt')
const verifyTicket = require('./ticketValidator')

module.exports = {
    verifySignUp,
    authJwt,
    verifyTicket
}