const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;




mongoose.connect(uri)
.then(()=> console.log("Connected to MongoDB"))
.catch((error)=> console.log(error))



const userAuthRoutes = require("./routes/userAuth.router")



app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.use("/api/v1/auth/user", userAuthRoutes);


app.listen(port, ()=>{
    console.log(`Server Started and Runnning on ${port}`)
})