const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtsecret = process.env.JWT_SECRET
const {handleError} = require("../utils/errorHandler");
const User = require("../models/userModel");


const authenticateUser = async (request, response, next) => {
    
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        
        const token = request.headers.authorization.split(" ")[1]

        try {
            
            const decoded = jwt.verify(token, jwtsecret)
            request.user = decoded.id
            request.school = decoded.school

            const user = await User.findById(decoded.id);
            console.log(user)

            if(!user){
               return response.status(401).json(handleError(401, "Unauthorized", "The Client is Trying to Access an Authorized Endpoint with an Invalid Token"))
            }

            if(user.blocked){
                return response.status(401).json(handleError(401, "Unauthorized", "the user is blocked and can not access this endpoint"))
            }

            if(!user.logged){
               return response.status(401).json(handleError(401, "Unauthorized", "You are not Logged in, please Login and try again"))
            }

            //Check if User is Blocked

            next()
        } catch (error) {

            response.status(401).json(handleError(401, "Unauthorized", "The Client is Trying to Access an Authorized Endpoint with an Invalid Token"))
            console.log(error)
        }

    } else {
        response.status(401).json(handleError(401, "Unauthorized", "Authorization Header with Bearer Token Required"))
        
    }

}

module.exports = authenticateUser;