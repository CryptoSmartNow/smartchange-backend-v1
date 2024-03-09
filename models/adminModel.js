const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const adminSchema = new Schema({

    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,

    },
    validation:{
        token:String,
        expiresIn:String
    },
    role:{
        type:String,
        enum:["admin","moderator"],
        default:"admin"
    }

},{timestamps:true})


const Admin = mongoose.model("admin",adminSchema);

module.exports = Admin;