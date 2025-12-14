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
    
    if (file.fieldname.startsWith('images')) {
      cb(null, "property-image-" + uniqueSuffix + ext);
    } else if (file.fieldname === 'video') {
      cb(null, "property-video-" + uniqueSuffix + ext);
    } else {
      cb(null, "property-file-" + uniqueSuffix + ext);
    }
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only video files are allowed (mp4, mov, avi, mkv, webm)"));
  }
};

// Create upload middlewares
const uploadImages = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video
  },
});

// Simple upload for images
export const uploadImagesMiddleware = uploadImages.array("images", 10);

// Simple upload for video
export const uploadVideoMiddleware = uploadVideo.single("video");

// Combined upload middleware (FIXED)
export const uploadPropertyFiles = (req, res, next) => {
  // Use multer for multiple fields
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'images') {
        return imageFileFilter(req, file, cb);
      } else if (file.fieldname === 'video') {
        return videoFileFilter(req, file, cb);
      }
      cb(new Error('Unexpected field'));
    },
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max for any file
      files: 11 // 10 images + 1 video
    }
  }).fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed'
      });
    }
    next();
  });
};

export default uploadImagesMiddleware;