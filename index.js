const express = require("express");

const cors = require("cors");

const server = express();

const dataService = require("./services/dataService");

const jwt = require("jsonwebtoken");

//cors
server.use(
  cors({
    origin: "http://localhost:4200",
  })
);

//to parse json data
server.use(express.json());

server.listen(3000, () => {
  console.log("server started at 3000");
});

const appMiddleware = (req,res,next)=>{
    console.log('inside middleware');
    next()
}

server.use(appMiddleware)

// token verify middleware
const jwtMiddleware =(req,res,next)=>{
    const token = req.headers['access-token']
    console.log(token);
    try{
      const data=jwt.verify(token,'secretkeyabc123')
      console.log(data);

      req.fromAcno=data.currentAcno
      next()
    }
    catch{
      console.log('invalid token');
      res.status(401).json({
        message:'Please Login'
      })
    }
}

// Register

server.post("/register", (req, res) => {
  console.log("inside register function");
  console.log(req.body);
  dataService
    .register(req.body.uname, req.body.acno, req.body.pswd)
    .then((result) => {
      res.status(result.statusCode).json(result);
    });
});
//login
server.post("/login", (req, res) => {
  console.log("inside login  function");
  console.log(req.body);
  dataService.login(req.body.acno,req.body.pswd).then((result) => {
    res.status(result.statusCode).json(result);
  });
});
server.get("/getBalance/:acno",jwtMiddleware, (req, res) => {
  console.log("inside getBalace  function");
  console.log(req.params.acno);
  dataService.getBalance(req.params.acno).then((result) => {
    res.status(result.statusCode).json(result);
  });
});
server.post("/deposit",jwtMiddleware,(req,res)=>{
  console.log('inside deposit function');
  console.log(req.body);
  dataService.deposit(req.body.acno,req.body.amount)
  .then((result)=>{
    res.status(result.statusCode).json(result)
  })
})
server.post("/fundTransfer",jwtMiddleware,(req,res)=>{
  console.log('inside fundTransfer function');
  console.log(req.body);
  dataService.fundTransfer(req,req.body.toAcno,req.body.pswd,req.body.amount)
  .then((result)=>{
    res.status(result.statusCode).json(result)
  })
})
server.get("/getAllTransaction",jwtMiddleware,(req,res)=>{
  console.log('inside getAllTransaction function');
  dataService.getAllTransaction(req)
  .then((result)=>{
    res.status(result.statusCode).json(result)
  })
})

//delete account api

server.delete("/delete-account/:acno",jwtMiddleware, (req, res) => {
  console.log("inside delete account  function");
  console.log(req.params.acno);
  dataService.deleteMyAccount(req.params.acno).then((result) => {
    res.status(result.statusCode).json(result);
  });
});