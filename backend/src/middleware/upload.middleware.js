const multer = require('multer');
const path = require('path');
const fs = require('fs');

function createUploader(subfolder = 'documents', allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/) {
  const uploadDir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${subfolder}-${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('application/') || file.mimetype.includes('image/');

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only standard documents and images are supported.'));
  };

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter
  });
}

// Special uploader for student imports: accepts CSV & Excel by extension only
// (xlsx MIME = application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
function createImportUploader() {
  const subfolder = 'imports';
  const uploadDir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `import-${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.csv', '.xlsx', '.xls'];
    if (allowedExts.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error('Only CSV (.csv) and Excel (.xlsx, .xls) files are allowed for import.'));
  };

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter
  });
}

module.exports = {
  uploadPhoto: createUploader('photos', /jpeg|jpg|png|webp/),
  uploadDocument: createUploader('documents'),
  uploadSyllabus: createUploader('syllabus', /pdf|doc|docx/),
  uploadAssignment: createUploader('assignments'),
  uploadMaterial: createUploader('materials'),
  uploadImport: createImportUploader()
};
