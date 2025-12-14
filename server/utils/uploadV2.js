import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (file.fieldname === 'images') {
      cb(null, "property-image-" + uniqueSuffix + ext);
    } else if (file.fieldname === 'video') {
      cb(null, "property-video-" + uniqueSuffix + ext);
    } else {
      cb(null, "property-" + uniqueSuffix + ext);
    }
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'images') {
    if (allowedImageTypes.test(extname) && allowedImageTypes.test(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.test(extname) && allowedVideoTypes.test(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error("Only video files are allowed (mp4, mov, avi, mkv, webm)"));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

// Create upload middleware
export const uploadPropertyFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]);

// Simple middleware for only images
export const uploadImagesOnly = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).array('images', 10);