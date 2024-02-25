import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

//Router me apko ak route batata hu or ap is tarh dekhiye
router.route("/register").post(
    upload.fields([    //ye upload middleware he 
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]) ,  //this is middleware multer ao mujse mil ke jana
    registerUser
    )


export default router;