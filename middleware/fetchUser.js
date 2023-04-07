const jwt = require("jsonwebtoken");
require('dotenv').config();
// const SECRET_KEY = "mynameisshivam&don";
const fetchUser=(req,res,next)=>{
    const token=req.header('auth-token');  //extracting the token from the header
    if(!token)
     return res.status(401).send({error:"Please authenticate using valid token+tokenNotExist"})
   
     try {
        const data=jwt.verify(token,process.env.SECRET_KEY);//verifying the token with secrete key
          req.user=data.user;  //sending the user id in req
          next();
     } catch (error) {
        return res.status(401).send({error:"Please authenticate using valid token"})
     }
}
module.exports=fetchUser;