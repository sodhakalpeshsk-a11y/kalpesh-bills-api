const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'backup/' + path.dirname(file.originalname);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, path.basename(file.originalname))
  })
});

app.post('/api/dairy/upload', upload.single('file'), (req,res) => {
  res.json({ok:1});
