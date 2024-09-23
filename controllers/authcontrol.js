const catchAsyncError= require('../middleware/catchAsyncError');
const User= require('../models/userModel');
const sendEmail = require('../Utils/email');
const ErrorHandler= require('../Utils/errorHandler');
const sendToken = require('../Utils/jwt');
const crypto = require('crypto');
exports.registerUser = catchAsyncError(async(req, res, next) => {
      const { name, email, password}=req.body
       const user = await User.create({
        name,
        email,
        password
        
      });
     
      sendToken(user,201,res)
})
//login user//
exports.loginUser = catchAsyncError(async (req, res, next)=> {
  const{email,password} = req.body

  if(!email || !password){
    return next(new ErrorHandler('please enter email & password', 400));
  }
  //find the user database//
     const user= await User.findOne({email}).select('+password');

     if(!user){

return next(new ErrorHandler('invalid enter email or password', 401));

     }

     if(!await user.isValidPassword(password)){
      return next(new ErrorHandler('invalid email or password', 401));


     }
     sendToken(user,201,res)

     const ticket = user.getJWtToken();

     res.status(201).json({
       success: true,
       user,
       ticket
     });

})
//logout user//
exports.logoutUser =(req, res, next) => {
  res.cookie('ticket', null, { expires: new Date(Date.now()),
      httpOnly: true
   })
   .status(200).json({
    success: true,
    message: 'Logged out successfully'
   })
  

  }
  //forget password//
  exports. forgetPassword =catchAsyncError(async (req,res,next) => {
     const user = await User.findOne({email: req.body.email});


     if(!user){
       return next(new ErrorHandler('No user found with that email', 404));
     }
     //generate reset token//
     const resetTicket = user.getResetTicket();
     await user.save({ validateBeforeSave: false });

     let BASE_URL = process.env.FRONTEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
     
     //create reset url//
     const resetUrl = `${BASE_URL }/Password/reset/${resetTicket}`;
     const message = `your password reset url is as follows  \n\n
     ${resetUrl} \n\n if you have not requested this email, then ignore it.`;

     try{
       await sendEmail({
         email: user.email,
         subject: 'Password reset recovery',
         message

 })
 res.status(200).json({
   success: true,
    message: `Email sent successfully. Please check your inbox ${user.email}`});


     }catch(error){
      user.resetPasswordToken=undefined;
      user.resetPasswordTokenExpire =undefined;
      await user.save({ validateBeforeSave: false });
       return next(new ErrorHandler(error.message),500);

     }


  })

  //resetPassword//
  exports.resetPassword = catchAsyncError(async (req,res,next) => {
    const resetPasswordToken = crypto.createHash('sha256').update (req.params.ticket).digest('hex');
    
const user =await User.findOne({
  resetPasswordToken,
  resetPasswordTokenExpire: {$gt: Date.now()}
})
if (!user) {
  return next(new ErrorHandler('password reset token expired or invalid password'));
}
if(req.body.password !== req.body.confirmPassword) {
  return next(new ErrorHandler('Passwords do not match'),400);
}

user.password = req.body.password;

user.resetPasswordToken = undefined;

user.resetPasswordTokenExpire = undefined;


await user.save({validateBeforeSave: false});

sendToken(user, 200, res);
   
  })

  //get user profile//
  exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });

  })
  //(change password//
  exports.changePassword = catchAsyncError(async (req, res, next) => {
    
    const user = await User.findById(req.user.id).select('+password');

    //check the old password//
    if( await user.isValidPassword(req.body.oldPassword)){

      return next(new ErrorHandler('old password is incorrect'),401);
    }
    //assigning  new password//
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
    
  })
  //update user profile//
  exports.updateProfile = catchAsyncError (async(req, res, next) => {
    let newUserData ={
      name: req.body.name,
      email: req.body.email 
    }
    let newUser
    if(req.file){
      newUserData ={...newUserData ,newUser}
    }
      
    
    
      const user = await User.findByIdAndUpdate (req.user.id, newUserData,{
      new: true,
      runValidators: true
    })
       
    res.status(200).json({
      success: true,
      user
    })

  })

  //Admin: get all users//
  exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users
    })

  })
    
  //Admin Specific user//
  exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new ErrorHandler(`No user found with that id ${req.params.id}`));
    }
    res.status(200).json({
      success: true,
      user
    })

  })


  //Admin update user//
  exports.updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData ={
      name: req.body.name,
      email: req.body.email,
      role: req.body.role 
      
    }
      const user = await User.findByIdAndUpdate (req.params.id, newUserData,{
      new: true,
      runValidators: true
    })
       
    res.status(200).json({
      success: true,
      user
    })


   
  })

  //Admin delete user//
  exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
      return next(new ErrorHandler(`No user found with that id ${req.params.id}`));
    }
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
    
    })
    
    