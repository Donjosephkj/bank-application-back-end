const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/bank',()=>{
    console.log('db connected successfully');
})

const User = mongoose.model('User',{
    username:String,
    acno:Number,
    password:String,
    balance:Number,
    transaction:[]
})

module.exports={
    User
}