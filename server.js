const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// uploads ફોલ્ડર
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
// ફાઈલ ડાઉનલોડ કરવા માટે API
app.get('/api/dairy/download', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'DairyDatabase.rar');
    
    // જો ફાઈલ ન હોય તો
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'ફાઈલ મળી નહીં સાહેબ' });
    }
    
    // ડાઉનલોડ કરાવો
    res.download(filePath, 'DairyDatabase.rar', (err) => {
        if (err) {
            console.log('Download Error:', err);
            res.status(500).send('Download માં Error');
        }
    });
});

// તમારો જૂનો કોડ - એમ જ રહેવા દીધો
app.post('/save-data', (req, res) => {
    try {
        const { folder, mobile, fat, ltr, amount } = req.body;
        if (!folder) return res.status(400).send('Folder name required');

        const dir = path.join(__dirname, folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const date = new Date().toISOString().slice(0, 10);
        const filepath = path.join(dir, date + '.txt');
        const data = `Mobile: ${mobile}, Fat: ${fat}, Ltr: ${ltr}, Amount: ${amount}\n`;

        fs.appendFileSync(filepath, data);
        res.send('Saved successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/list-data', (req, res) => {
    try {
        const folders = fs.readdirSync(__dirname).filter(f => {
            return fs.statSync(path.join(__dirname, f)).isDirectory() &&!isNaN(f);
        });
        let result = {};
        folders.forEach(folder => {
            const files = fs.readdirSync(path.join(__dirname, folder));
            result[folder] = files;
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/download/:folder/:file', (req, res) => {
    try {
        const filepath = path.join(__dirname, req.params.folder, req.params.file);
        if (fs.existsSync(filepath)) res.download(filepath);
        else res.status(404).send('File not found');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// વધારાનો }).catch હટાવી દીધો

app.get('/', (req, res) => {
    res.send('Kalpesh Dairy API Live ✅');
});

// File Upload માટે નવો રૂટ - આ ઉમેર્યું
app.post('/api/dairy/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        console.log('File saved:', req.file.filename);
        res.status(200).json({ success: true, filename: req.file.filename, size: req.file.size });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DB વાળા રૂટ - એક જ વાર રહેવા દીધા
app.get('/api/dairy/records', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        const records = await db.collection('dairy_records').find({}).sort({ uploadedAt: -1 }).limit(100).toArray();
        res.json({ success: true, count: records.length, data: records });
    } catch (err) {
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});

app.delete('/api/dairy/records', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        const result = await db.collection('dairy_records').deleteMany({});
        res.json({ success: true, message: `All ${result.deletedCount} records deleted` });
    } catch (err) {
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Port: ${PORT}`);
    console.log('Server ચાલુ છે');
});
