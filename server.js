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


// બધી ફાઈલનું લિસ્ટ જોવા માટે
app.get('/api/dairy/list', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        if (files.length === 0) return res.send('હજુ કોઈ ફાઈલ નથી સાહેબ');
        
        let html = '<h2>સેવ થયેલી ફાઈલ</h2>';
        files.reverse().forEach(f => {
            html += `<p><a href="/uploads/${f}" target="_blank">${f}</a></p>`;
        });
        res.send(html);
    } catch (e) {
        res.send('Error: ' + e.message);
    }
});

// ફાઈલ ડાઉનલોડ કરવા માટે
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath); // ડાઉનલોડ થઈ જશે
    } else {
        res.send('ફાઈલ મળી નહીં - Render એ ઉડાડી દીધી હશે');
    }
});

app.listen(port, () => console.log('Server ચાલુ'));
