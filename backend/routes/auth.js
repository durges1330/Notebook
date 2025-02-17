const express = require('express');

const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Durgesh$1330"

//Route  1Create a User using :POST "/api/auth/createuser". No login required
router.post('/createuser', [

        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid Email').isEmail(),
        body('password', 'Password must be 5 characters').isLength({ min: 5 })
], async (req, res) => {
        let success=false;
        // IF there are errors, then return Bad request and the errors.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                return res.status(400).json({ success,errors: errors.array() });
        }
        //let check whether the user with email exist already or not.
        try {
                let user = await User.findOne({ email: req.body.email });
                if (user) {
                        return res.status(400).json({success, errror: "Sorry a user with this email already exists" })
                }
                const salt = await bcrypt.genSalt(10)
// Password become more secure by conveting into Hash table
//  and by Using bycryptjs library for hashing the password. 
                const secPass =  await bcrypt.hash(req.body.password,salt);
                user = await User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: secPass,
                })
                // .then(user => res.json(user))
                // .catch(err=>{console.log(err)
                //res.json({error : 'Please Enter valid Email and Unique '})})
                const data= {
                        user:{
                          id: user.id      
                        }
                }
                const authtoken = jwt.sign(data,JWT_SECRET);
                success=true
                res.json({success,authtoken})


        } catch (error) {
                console.error(error.message);
                res.status(500).send("Some error occured Internal");
        }
})
//Authenicate a Using:POST "/api/auth/login". No login Required.
router.post("/login",[
        body("email", 'Enter a valid mail').isEmail(),
        body('password', "Password cannot be blank").exists(),

],async (req ,res)=>{
        let success=false;
        const errors =validationResult(req);
        if (!errors.isEmpty()){
                return res.status(600).json({errors:errors.array()});
        }

const{email,password} = req.body;
try{
        let user = await User.findOne({email});
        if (!user){
                return res.status(700).json({error: "Please ttry to login with correct credentials"});

        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if (!passwordCompare){
                success=false;
                return res.status(800).json({success,error:"Please login with correct credentials"});

        }
        const data = {
                user:{
                        id:user.id
                }
        }
        const authtoken = jwt.sign(data,JWT_SECRET);
        success= true;
        res.json({success,authtoken})

}catch(error){
        console.error(error.message);
        res.status(900).send('Internal Server Error');

}

})
//ROUTE : Getlogggedin User Details using POST: "/api/auth/getuser". Login Required.
router.post('/getuser', fetchuser,  async (req, res) => {

        try {
          userId = req.user.id;
          const user = await User.findById(userId).select("-password")
          res.send(user)
        } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal Server Error");
        }
      })
module.exports =router