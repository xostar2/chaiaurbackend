const asyncHandler =(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}


//error handling



export{asyncHandler};







//===try =catch method

// const asyncHandler =(fn)=> async (req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }catch(err){
//         res.status(err.code ||500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }