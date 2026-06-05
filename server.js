const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.post('/api/dairy/upload', (req, res) => {
    try {
        // ફોલ્ડર કોડ અલગ લો, ડેટાના વેન્ડર કોડ સાથે લેવા-દેવા નથી
        const folderCode = req.body.folderCode || '000';
        const records = req.body.records; // ડેટા અલગ

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).send('ડેટા ખાલી છે');
        }

        const currdate = records[0].currdate;
        const session = records[0].session1 || 'M';

        // 2026-06-03 → 03062026
        const fileDate = currdate.split('-').reverse().join('');
        const filename = fileDate + session + '.Txt';

        // ફોલ્ડર: Dairy-data/001/ - આ folderCode થી બનશે
        const dir = path.join(__dirname, 'Dairy-data', folderCode);
        fs.mkdirSync(dir, { recursive: true });

        // ફાઈલની અંદર: ડેટા એમ ને એમ, જે.mdb માં છે એ
        let fileContent = '';
        records.forEach(rec => {
            fileContent += `${rec.currdate},${rec.srNo},${rec.vendorCode},${rec.type},${rec.fat},${rec.ltr},${rec.amount},${rec.currTime},${rec.session1},${rec.rate},${rec.prv_prc},${rec.jama_prc},${rec.pmtamt}\n`;
        });

        fs.writeFileSync(path.join(dir, filename), fileContent, 'utf8');
        res.send(`સેવ થયું: Dairy-data/${folderCode}/${filename}`);

    } catch (err) {
        res.status(500).send('એરર: ' + err.message);
    }
});
app.get('/download/:folderCode/:filename', (req, res) => {
    const folderCode = req.params.folderCode;
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'Dairy-data', folderCode, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath); // ફાઈલ ડાઉનલોડ થશે
    } else {
        res.status(404).send('File not found: ' + filename);
    }
});
// ચોક્કસ તારીખ અને સેશનનો ડેટા આપશે
app.get('/api/dairy/get/:folderCode/:date/:session', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const { folderCode, date, session } = req.params; // date = DDMMYYYY, session = M or E
    const filename = date + session + '.Txt';
    const filePath = path.join(__dirname, 'Dairy-data', folderCode, filename);
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.type('json').send(content);
    } else {
        res.status(404).json({ error: 'File not found: ' + filename });
    }
});
// 1. ફાઈલ ક્યાં સેવ કરવી તે સેટિંગ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderCode = req.body.folderCode || '001'; // VB6 માંથી 001 આવશે
    const uploadPath = path.join(__dirname, 'Dairy-data', folderCode);
    
    // ફોલ્ડર ન હોય તો બનાવી દે
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // Dairy-data/001 માં સેવ થશે
  },
  filename: (req, file, cb) => {
    // VB6 માંથી fileName આવે તો એ વાપર, નહીંતર ઓરિજિનલ નામ
    const customName = req.body.fileName;
    cb(null, customName || file.originalname);
  }
});

const upload = multer({ storage: storage });

// 2. અપલોડ માટેનું API
app.post('/api/dairy/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'ફાઈલ મળી નથી' });
  }
  
  const savedFiles = req.files.map(f => f.filename);
  res.json({ 
    message: 'બધી ફાઈલ સેવ થઈ ગઈ ✅', 
    folder: req.body.folderCode,
    files: savedFiles 
  });
});

app.get('/', (req, res) => res.send('API Live ✅'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Port: ${PORT}`));
