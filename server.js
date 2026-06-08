const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// multer સેટઅપ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'backup/' + path.dirname(file.originalname); // 001/ ફોલ્ડર
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname)); // DairyDatabase.mdb
  }
});
const upload = multer({ storage });

// ફક્ત 1 જ વાર આ રૂટ લખો
app.post('/api/dairy/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: 0, message: "ફાઈલ મળી નથી!" });
  }
  console.log("File saved:", req.file.path);
  res.json({ 
    ok: 1, 
    message: "ફાઈલ સક્સેસફુલી અપલોડ થઈ ગઈ!", 
    path: req.file.path 
  });
});

// ચેક કરવા માટે
app.get('/', (req, res) => {
  res.send("Dairy API ચાલુ છે");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
