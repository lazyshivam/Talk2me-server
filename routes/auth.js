const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const fetchUser=require('../middleware/fetchUser');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
//Route-1:POST:creating a new user using:api/auth/createuser,no login required
router.post(
  "/createuser",
  [
    body("name", "Please enter a valid name.").isLength({ min: 3 }), //validation of user entered value
    body("email", "Please enter a valid email.").isEmail(),
    //
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //check whether the entered values are valid or not.
    // let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success:false, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email }); //check whether the entered email already exists
      if (user) {
        return res
          .status(400)
          .json({ success:false,error: "User with this email already exists." });
      }

      //making hash of user passwors to secure the data
      const salt = await bcrypt.genSalt(10);
      //satl generated
      const secPass = await bcrypt.hash(req.body.password, salt); //adding salt to the user intered pass and genrating hash

      //creating a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, SECRET_KEY);
      //sending the token of new created user as a respose
     
      res.json({success:true, authtoken });
    } catch (error) {
      console.error(error.message);
      console.log(error);
      res.status(500).send("Server internal error occured");
    }
  }
);


//Route-2:Authenticate a user using :POST:api/auth/login ,no login required
router.post(
  "/login",
  [
    body("email", "Please enter a valid email.").isEmail(),
    //
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //check whether the entered values are valid or not.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     
      return res.status(400).json({ success:false,errors: errors.array() });
    }
    const { email, password } = req.body; //destructuring the value from body
    try {
      let user = await User.findOne({ email }); //finding the user with entered email
      if (!user)
        return res
          .status(400)
          .json({success:false, error: "Please try to login with correct credentials" });
      const passcompare = await bcrypt.compare(password, user.password); //compare the user entered pass and actual pass stored in database
      if (!passcompare)
        return res
          .status(400)
          .json({ success:false,error: "Please try to login with correct credentials" });

      //if both credentials are correct then sending the paylaod
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, SECRET_KEY);
      // success=true;
      //sending the token of loged in user as a respose
      res.json({success:true, authtoken:authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server internal error occured");
    }
  }
);


//Route-3:Get the user details using :POST:/api/auth/getuser,login required

router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select("-password"); //with the help
    res.send(user);
  
  } catch (error) {
    console.error(error.message);
      res.status(500).send("Server internal error occured");
  }
});

//Route-4:fiding all data from database of logged in users

router.get('/all', async(req, res) => {
  try {
    // const userid = req.user.id;
    const user = await User.find().select(["-password","-_id","-date"]); //with the help
    res.send(user);
   
  
  } catch (error) {
    console.error(error.message);
      res.status(500).send("Server internal error occured");
  }
  });
// });
module.exports = router;
