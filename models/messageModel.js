const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath:"receiverModel",
    required: true
  },
  receiverHash:String
  ,
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  seen:{
    type:Boolean,
    default:false
  } ,
  senderModel: {
    type: String,
    required: true,
    enum: ['user', 'merchant']
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['user', 'merchant'] 
  }
},{timestamps:true});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
