const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const userSchema = new Schema({

    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        
    },
    phoneNo:{
        type:String
    },
    profilePicture:{
        type:String,
    },
    numberOfTrades:{
        type:Number,
        default:0
    },
    logged:{
        type:Boolean,
        default:false
    },
    blocked:{
        type:Boolean,
        default:false
    },
    validated:{
        type:Boolean,
        default:false
    },
    validation:{
        token:String,
        expiresIn:String
    },
    messaging_token:String


},{timestamps:true});

const User = mongoose.model("user", userSchema);

module.exports = User;