const mongoose = require("mongoose");
const schema = mongoose.Schema;


const merchantSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    phoneNo:{
        type:String
    },
    profilePicture:{
        type:String
    },
    idCard:{
        type:String
    },
    documentVerified:{
        type:Boolean,
        default:false
    },
    verified:{
        type:Boolean,
        default:false
    },
    paymentMethods:[String],
    blocked:{
        type:Boolean,
        default:false
    },
    accountDetails:{
        bankName:String,
        accountNumber:String,
        accountName:String
    },
    quickResponses:[String],
    trades:{
        type:Number,
        default:0
    },
    active:{
        type:Boolean,
        default:true
    },
    rates:{
        buying:[{currency:String,rate:String}],
        selling:[{currency:String,rate:String}]
    },
    logged:{
        type:Boolean,
        default:false
    },
    validated:{
        type:Boolean,
        default:false
    },



},{timestamps:true});

const Merchant = mongoose.model("merchant", merchantSchema);


module.exports = Merchant;