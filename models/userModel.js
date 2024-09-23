const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        minlength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate:[ validator.isEmail,'please enter a valid email']
        
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        maxLength: [6, 'password must be at least 6 characters'],
        select: false
    },
    avatar:{
        type: String,
       
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken:  String,
    
    resetPasswordTokenExpire: Date,


    createAt:{
        type: Date,
        default: Date.now
    },


});
userSchema.pre('save',  async function(next){
   if(!this.isModified('password')){
    next();
   }
    this.password =  await bcrypt.hash(this.password,10 )
    
})
    userSchema.methods.getJWtToken =function(ticket){
      return jwt.sign({id:this.id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
     } )

    }
    userSchema.methods.isValidPassword = async function(enteredPassword){
        return   bcrypt.compare(enteredPassword, this.password )

    }
    userSchema.methods.getResetTicket= function (){

        //generate Ticket//..
         const ticket = crypto.randomBytes(20).toString('hex');
         //generate hash resetpassword ticket//
          this.resetPasswordToken = crypto.createHash('sha256').update(ticket).digest('hex');

          //set ticket  expiration time//
          this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000; // 30minutes

          return ticket
    }
let model =mongoose.model('User', userSchema);

module.exports = model;