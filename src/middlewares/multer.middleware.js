import multer from "multer";

// documentation is must to read to get knowledge about multer upload and destination

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
       
      cb(null, file.originalname)//it can be  changed in future
    }
  })
  
  export const upload = multer({  storage 
  }) 