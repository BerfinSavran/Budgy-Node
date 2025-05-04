const express = require("express")

const route = express.Router()

route.get("/add",(req,res)=>{
    res.send("ADD")
})

route.get("/delete",(req,res)=>{
    res.send("Delete")
})

route.post("/test",(req,res)=>{
    const {deneme,param2} = req.body
    console.log(deneme)
    console.log(param2)
    res.send("Test")
})

module.exports = route