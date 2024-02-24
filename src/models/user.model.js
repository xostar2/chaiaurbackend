import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


//direct encryption is not possible so we use some mongoose hooks
//bcrypt=it hash your password
//jsonwebtoken =lean about it more
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true, //for seaching field enable
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            //index:true, //for seaching field enable
        },
        fullname:{
            type:String,
            required:true,
            //unique:true,
            //lowercase:true,
            trim:true,
            index:true, //for seaching field enable
        },
        avatar:{
            type:String,//cloudinary url
            required:true,
            // unique:true,
            // lowercase:true,
            // trim:true,
            // index:true, //for seaching field enable
        },
        coverimage:{
            type:String,//cloudinary url
            // required:true,
            // unique:true,
            // lowercase:true,
            // trim:true,
            // index:true, //for seaching field enable
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video",

            }
        ],
        password:{
            type:String,
            required:[true,"password is required"]


        },
        refreshToken:{
            type:String,

        }
          

    },
    {
        timestamps:true
    }
)
//JWT.io website to see token
//pre hook=middleware to encrypt password just befor saving the password on save event
//next for for forword and at end call next
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();//we use this for below problem
    this.password=bcrypt.hash(this.password,10)//rounds
    next() 
    
    //we can inject our own methods coustommethod
    
    
    
    //this normal code accutlly run every time when something user change and we dont wnat that
                  //so we use other method
})   //not use arror function in callback

//checking correct password
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

//JWT=json web token it is a bearer token that means whoever has that token i send data to that token


userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },//this was payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

//generating refresh token=less information
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            // email:this.email,
            // username:this.username,
            // fullname:this.fullname,
        },//this was payload,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}


userSchema.methods.generateRefreshToken=function(){}

export const User =mongoose.model("User",userSchema)