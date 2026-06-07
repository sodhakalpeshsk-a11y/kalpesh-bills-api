const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use(express.json({limit: '50mb'})); // JSON માટે
const upload = multer({ dest: 'uploads/' }); // ફાઈલ માટે

// API 1: ફક્ત JSON ડેટા સેવ કરવા - તમારું 001 વાળું બટન
app.post('/api/dairy/json', (req, res) => {
    try {
        const jsonData = req.body;
        const fileName = Date.now() + '-SendData.json';
        fs.writeFileSync(path.join(uploadDir, fileName), JSON.stringify(jsonData, null, 2));
        console.log('JSON Saved:', fileName);
        res.json({ success: true, file: fileName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 2: ફક્ત RAR ફાઈલ Upload કરવા - અલગ બટન
app.post('/api/dairy/rar', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'ફાઈલ મળી નહીં' });
        
        const newName = Date.now() + '-' + req.file.originalname;
        fs.renameSync(req.file.path, path.join(uploadDir, newName));
        
        console.log('RAR Saved:', newName);
        res.json({ success: true, file: newName });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log('Server ચાલુ'));
