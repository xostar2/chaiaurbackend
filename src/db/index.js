import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB= async () => {

    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI1}/${DB_NAME}`);

        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("MONGODB connection error : ",error);
        process.exit(1);//use as throw
    }
}

export default connectDB;
// git add index.html
// git commit -m "daily update"
// git push origin main

