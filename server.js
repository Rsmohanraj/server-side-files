const app =require('./app');
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const connectDatabase = require('./config/database')
const cors = require('cors');




connectDatabase();
app.use(express.json());
app.use(cors({
    origin:"https://clever-capybara-b585a7.netlify.app/",
    credential:true,
    
}));

const server = app.listen(process.env.PORT,()=>{
    console.log(`My Server listening to the port: ${process.env.PORT} in  ${process.env.NODE_ENV} `)
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled rejection error');
    server.close(()=>{
        process.exit(1);
    })




})

process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception error');
    server.close(()=>{
        process.exit(1);
    })
})
