const ErrorHandler = require('../Utils/errorHandler');
const User = require('../models/userModel')
const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser =  catchAsyncError(async (req, res, next) => {
 const { ticket } = req.cookies;

 if(!ticket){
    return next(new ErrorHandler('login first to access this route', 401));
 }

 const decoded = jwt.verify(ticket, process.env.JWT_SECRET)
 req.user = await User.findById(decoded.id)
 next();


   } )
   exports.authorizeRoles =(...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed`,401));
        }
        next()
    }
   }