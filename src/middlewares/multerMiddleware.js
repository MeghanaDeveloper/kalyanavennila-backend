

const multerMiddleware = (err, req, res, next) => {
    if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File size exceeds 10KB limit!" });
        }
        if (err.message === "Only image files are allowed!") {
            return res.status(400).json({ error: "Only image files (JPG, PNG, etc.) are allowed!" });
        }
        return res.status(400).json({ error: "File upload failed!", details: err.message });
    }
    next(); 
};



module.exports = {
    multerMiddleware,
    
};
