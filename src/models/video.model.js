import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile:{
            type:String, //cloudry url
            required:true, 
        },
        thumbnail:{
            type:String, 
            required:true, 
        },
        title:{
            type:String, 
            required:true, 
        },
        duration:{
            type:Number, //cloudry url
            required:true, 
        },
        views:{
            type:Number, //cloudry url
            default:0, 
        },
        isPublished:{
            type:Boolean, //cloudry url
            default:true, 
        },
        owner:{
           type:Schema.Types.ObjectId,
           ref:"User" 
        }
    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)//aggregation query
export const Video = mongoose.model("Video",videoSchema)