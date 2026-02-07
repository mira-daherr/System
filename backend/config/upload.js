// config/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تأكد من وجود المجلد
const uploadDir = path.join(__dirname, '..', 'public', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات التخزين
const storage = multer.diskStorage({
  // وين رح نحفظ الصور
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  // اسم الملف
  filename: function (req, file, cb) {
    // احصل على الامتداد (extension) من الملف الأصلي
    const ext = path.extname(file.originalname);
    // أنشئ اسم فريد باستخدام التاريخ
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

// فلتر أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
  // أنواع الصور المسموحة
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'));
  }
};

// إعداد multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maximum
  },
  fileFilter: fileFilter
});

module.exports = upload;