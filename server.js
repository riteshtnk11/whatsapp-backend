import express from "express";

//creating app server
const app = express();
const port = process.env.PORT || 9000;

//api routes
app.get("/", (req,res)=>res.status(200).send("Hello"));

// listen
app.listen(port, ()=>console.log(`Listening on localhost:${port}`));