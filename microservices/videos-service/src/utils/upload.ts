import multer from "multer";
import path from "path";
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);  
    },
    filename: (req, file, cb) => {
      // Using the original filename with its extension
      const originalName = path.basename(file.originalname, path.extname(file.originalname));
      const ext = path.extname(file.originalname);

      // Save the file with its original name
      cb(null, `${originalName}${ext}`);
    },
  }),
  limits: { fileSize: 10000000000 }, // Limit to 10MB
});
