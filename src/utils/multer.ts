import multer from 'multer';
import fileType from 'file-type';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        const error: any = new Error('Incorrect file');
        return cb(error, false);
      }
      cb(null, true);
    }
  })

  export {upload}
  
