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
app.post('/api/dairy/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: 0, message: "ફાઈલ મળી નથી!" });
  }
  // આ મેસેજ VB6 ની ઈમીડિએટ વિન્ડોમાં દેખાશે
  res.json({ 
    ok: 1, 
    message: "ફાઈલ સક્સેસફુલી અપલોડ થઈ ગઈ છે!", 
    path: req.file.path 
  });
});
app.post('/api/dairy/upload', upload.single('file'), (req,res) => {
  res.json({ok:1});
