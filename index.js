const express=require("express");
// import connection
const bcrypt = require('bcrypt');
const jwt=require("jsonwebtoken");
const cors=require("cors");
const {connection} =require("./config/db");
const {UserModel}= require("./models/UserModel");
const { authentication } = require("./middlewares/authentication");
const { BMIModel } = require("./models/BMIModel");
const {PersonalModel} =require("./models/PersonalModel");
require("dotenv").config();
const app=express();

app.use(cors());

app.use(express.json());

// app.get("/",(req,res)=>{
//     res.send("HomePage");
// })

// personal schema
app.post('/', async (req, res) => {
    try {
      const personalinfo = new PersonalModel(req.body);
      await personalinfo.save();
      res.status(201).send(personalinfo);
    } catch (error) {
      res.status(400).send(error);
    }
  });

  
// Get all user infos
app.get('/', async (req, res) => {
    try {
      const userInfos = await PersonalModel.find();
      res.send(userInfos);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Get a single user info
  app.get('/:id', async (req, res) => {
    try {
      const userInfo = await PersonalModel.findById(req.params.id);
      if (!userInfo) {
        return res.status(404).send();
      }
      res.send(userInfo);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Update a user info
  app.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['account_id', 'first_name', 'last_name', 'email', 'cell_phone', 'home_phone', 'photo', 'address'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    try {
      const userInfo = await PersonalModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!userInfo) {
        return res.status(404).send();
      }
      res.send(userInfo);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Delete a user info
  app.delete('/:id', async (req, res) => {
    try {
      const userInfo = await PersonalModel.findByIdAndDelete(req.params.id);
      if (!userInfo) {
        return res.status(404).send();
      }
      res.send(userInfo);
    } catch (error) {
      res.status(500).send(error);
    }
  });


app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    const user=await UserModel.findOne({email})
    const hashed_password=user.password;
    const user_id=user._id;
    console.log(user);
    console.log(user_id);
    bcrypt.compare(password, hashed_password, function(err, result) {
        // result == true
        if(err){
            res.send("Something Went Wrong,Try again Later");
        }
       
        if(result){
            const token=jwt.sign({user_id},process.env.SECRET_KEY);
            res.send({"msg":"Login SuccessFully",token});
        }
        else{
            res.send("Login Failed");
        }
    });

})

app.get("/getProfile",authentication,async(req,res)=>{
    const {user_id}=req.body;
    const user=await UserModel.findOne({_id:user_id});
    // console.log(user);
    const {name,email}=user;
    // res.send("rishi");
    res.send({name,email})


})

app.post("/calculateBMI",authentication,async(req,res)=>{
    const {height,weight,user_id}=req.body;
    const height_in_metre=Number(height)*0.3048;
    const BMI=Number(weight)/(height_in_metre)**2;
    const new_bmi=new BMIModel({
        BMI,
        height:height_in_metre,
        weight,
        user_id
    })
    await new_bmi.save();
    res.send({BMI});

})

app.get("/getCalculation",authentication,async(req,res)=>{
    const {user_id}=req.body;
    const all_bmi=await BMIModel.find({user_id:user_id})
    res.send({history:all_bmi});

})
// how to hash the password= bcrypt

app.post("/signup",async(req,res)=>{
    const {name,email,password}=req.body;
    // console.log(name,email,password);
    const isUser= await UserModel.findOne({email})
    if(isUser){
        res.send({msg:"User already exists,try log in"});
    }
    else {
        bcrypt.hash(password, 5, async function(err, hash) {
        // Store hash in your password DB.
        if(err){
            res.send({msg:"Someting Went Wrong"});
        }
        const new_user= new UserModel({
            name,
            email,
            password:hash
        })
        try{
            await new_user.save();
            res.send({mgs:"SignUp SuccessFully"});
        }
        catch(err){
            res.send({msg:"Something Went Wrong,Try Again Later"});
    
        }
    });
}
    // const new_user= new UserModel({
    //     name,
    //     email,
    //     password
    // })
    // try{
    //     await new_user.save();
    //     res.send("SignUp SuccessFully");
    // }
    // catch(err){
    //     res.send("Something Went Wrong,Try Again Later");

    // }
})

app.get("/about",(req,res)=>{
    res.send("AboutPage");
})

app.listen(8001,async()=>{
    try{
        await connection
        console.log("Connected to DB Successfully")
    }
    catch(err){
        console.log("Connection failed");
        console.log(err);
    }
    console.log("Listening to Port 8001");
})