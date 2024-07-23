const multer = require("multer");
const path = require("path");

// Configuring storage for images and PDFs separately
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set destination based on file type
        const fileType = path.extname(file.originalname).toLowerCase();
        if (fileType === '.pdf') {
            cb(null, "./public/pdfs");
        } else {
            cb(null, "./public/images");
        }
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + "_" + file.originalname);
    },
});

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
    const fileType = path.extname(file.originalname).toLowerCase();
    if (fileType === '.pdf' || fileType === '.jpg' || fileType === '.jpeg' || fileType === '.png' || fileType === '.gif') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;