const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Ensure upload subdirectories exist
const productsUploadDir = path.join(config.uploadDir, 'products');
const aiUploadDir = path.join(config.uploadDir, 'ai_symptoms');
const avatarsUploadDir = path.join(config.uploadDir, 'avatars');

[productsUploadDir, aiUploadDir, avatarsUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'ai_photo' || file.fieldname === 'symptom_image') {
      cb(null, aiUploadDir);
    } else if (file.fieldname === 'avatar') {
      cb(null, avatarsUploadDir);
    } else {
      cb(null, productsUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Veuillez envoyer une image (JPG, PNG, WEBP).'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter
});

module.exports = upload;
