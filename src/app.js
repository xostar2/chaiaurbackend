import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'//to use crud operations on users cookies 
const app= express()


//====these all are app configration which are necessary  to have in the files 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
})) //use =used for middleware


//default export app

app.use(express.json({limit : "16kb"}))//limiting the json data 

//URL

app.use(express.urlencoded({extended : true , limit: "16kb"}))

app.use(express.static("public"))//public assetes

app.use(cookieParser())//set cooies parser

export{app} 