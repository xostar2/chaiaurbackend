const asyncHandler =(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}


//error handling



export{asyncHandler};


//const asynchandler = () => {}
//const asynchandler = (func) =>()=> {}
//const asynchandler = (func) => async () => {}





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