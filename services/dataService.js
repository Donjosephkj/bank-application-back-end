const db = require("./db");
const jwt = require("jsonwebtoken");

const register = (uname, acno, pswd) => {
  return db.User.findOne({
    acno,
  }).then((result) => {
    console.log(result);
    if (result) {
      return {
        statusCode: 403,
        message: "Account already exist",
      };
    } else {
      //to add new user
      const newUser = new db.User({
        username: uname,
        acno: acno,
        password: pswd,
        balance: 0,
        transaction: [],
      });
      newUser.save();
      return {
        statusCode: 200,
        message: "Registration Succesful",
      };
    }
  });
};

//login
const login = (acno, pswd) => {
  console.log("inside login function");
  //check acno,pswd in db
  return db.User.findOne({
    acno,
    password: pswd,
  }).then((result) => {
    if (result) {
      //generate token
      const token = jwt.sign(
        {
          currentAcno: acno,
        },
        "secretkeyabc123"
      );
      return {
        statusCode: 200,
        message: "login succesfull",
        username: result.username,
        currentAcno: acno,
        token,
      };
    } else {
      return {
        statusCode: 404,
        message: "Invalid account number or password",
      };
    }
  });
};

//getBalance
const getBalance = (acno) => {
  return db.User.findOne({
    acno,
  }).then((result) => {
    if (result) {
      return {
        statusCode: 200,
        balance: result.balance,
      };
    } else {
      return {
        statusCode: 404,
      };
    }
  });
};

//deposit
const deposit = (acno, amt) => {
  let amount = Number(amt);
  return db.User.findOne({
    acno,
  }).then((result) => {
    if (result) {
      result.balance += amount;
      result.transaction.push({
        type: "Credit",
        fromAcno: acno,
        toAcno: acno,
        amount,
      });
      //update in mongoDb
      result.save();
      return {
        statusCode: 200,
        message: `${amount} Deposited Successfully`,
      };
    } else {
      return { statusCode: 404, message: "invalid Account" };
    }
  });
};

//fund transer
const fundTransfer = (req, toAcno, pswd, amt) => {
  let amount = Number(amt);
  let fromAcno = Number(req.fromAcno);
  console.log(fromAcno);
  return db.User.findOne({
    acno: fromAcno,
    password: pswd,
  }).then((result) => {
    console.log(result);
    if (fromAcno == toAcno) {
      return {
        statusCode: 401,
        message: "Permission denied due to own Account Transfer",
      };
    }
    if (result) {
      let fromAcnoBalance = result.balance;
      if (fromAcnoBalance >= amount) {
        result.balance = fromAcnoBalance - amount;
        return db.User.findOne({
          acno: toAcno,
        }).then((creditdata) => {
          if (creditdata) {
            creditdata.balance += amount;
            creditdata.transaction.push({
              type: "Credit",
              fromAcno,
              toAcno,
              amount,
            });
            result.transaction.push({
              type:"Debit",
              fromAcno,
              toAcno,
              amount
            })
            creditdata.save();
            result.save();
            return {
              statusCode: 200,
              message: "Transaction Successfully Completed",
            };
          } else {
            return {
              statusCode: 401,
              message: "Invalid Recipient Account Number",
            };
          }
        });
      } else {
        return {
          statusCode: 403,
          message: "Insufficient Balance",
        };
      }
    } else {
      return {
        statusCode: 401,
        message: "Invalid Password",
      };
    }
  });
};

//getAllTransaction
 const getAllTransaction = (req)=>{
  let acno=req.fromAcno
  return db.User.findOne({
    acno
  }).then((result)=>{
    if(result){
      return{
        statusCode:200,
        transaction:result.transaction
      }
    }
    else{
      return{
        statusCode:401,
        message:"Invalid Account Number"
      }
    }
  })
 }

//delete account
 const deleteMyAccount=(acno)=>{
return db.User.deleteOne({
  acno
}).then((result)=>{
  if(result){
    return{
      statusCode:200,
      message:"Account Deleted Succesfully"
    }
  }else{
    return{
      statusCode:401,
      message:"Invalid Account Number"
    }
  }
})
 }

module.exports = {
  register,
  login,
  getBalance,
  deposit,
  fundTransfer,
  getAllTransaction,
  deleteMyAccount
};
