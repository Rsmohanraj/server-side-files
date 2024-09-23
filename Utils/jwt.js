const sendToken =(user, StatusCode, res) => {


    //creating JWT Token//
    const ticket =user.getJWtToken();

    //setting cookies//
    const options ={
        expires:new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME *24 * 60 * 60 *1000 ),
    httpOnly: true,

    }
    
    
    //sending response with token and user data//
    res.status(StatusCode)
    .cookie('ticket',ticket, options )
    
    .json({
        success: true,
        ticket,
        user



    }).then
    
    
    
}
module.exports = sendToken;