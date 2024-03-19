// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"
import express from "express"
import mongoose from "mongoose"

dotenv.config({path:'./env'})

const PORT = process.env.PORT
connectDB()
.then(() =>{
    app.listen(PORT, () => {
        console.log('App listening on port',PORT)
    })
})
.catch(res => {
    console.log("Connection Failed", res)
})






// const app = express();

// (async ()=> {
// try {
    
//   await  mongoose.connect(`mongodb+srv://rahul27109:Rahul6303%40@yt.ukrcwrd.mongodb.net/YT`)
//     app.on("Error: ",(error)=>{
//         console.log("ERR:" ,error)
//         throw error
//     } )

//     app.listen(process.env.PORT, ()=>{
//         console.log("App is listening on port:",process.env.PORT)
//     })
// } catch (error) {
//     console.error("ERR: ",error)
//     throw error
// }
// })()