const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.post('/api/dairy/upload', (req, res) => {
    try {
        const records = req.body;
        if (!records || records.length === 0) {
            return res.status(400).send('ડેટા ખાલી છે');
        }

        // ફોલ્ડર માટે 001 ફોર્મેટ: 1 → "001", 12 → "012", 101 → "101"
        const folderName = String(records[0].vendorCode).padStart(3, '0');

        const currdate = records[0].currdate;
        const session = records[0].session1 || 'M';

        // 2026-06-03 → 03062026
        const fileDate = currdate.split('-').reverse().join('');
        const filename = fileDate + session + '.Txt';

        // ફોલ્ડર: Dairy-data/001/
        const dir = path.join(__dirname, 'Dairy-data', folderName);
        fs.mkdirSync(dir, { recursive: true });

        // ફાઈલની અંદર: vendorCode એમ ને એમ.mdb વાળો જ
        let fileContent = '';
        records.forEach(rec => {
            fileContent += `${rec.currdate},${rec.srNo},${rec.vendorCode},${rec.type},${rec.fat},${rec.ltr},${rec.amount},${rec.currTime},${rec.session1},${rec.rate},${rec.prv_prc},${rec.jama_prc},${rec.pmtamt}\n`;
        });

        fs.writeFileSync(path.join(dir, filename), fileContent, 'utf8');
        res.send(`સેવ થયું: Dairy-data/${folderName}/${filename}`);

    } catch (err) {
        res.status(500).send('એરર: ' + err.message);
    }
});

app.get('/', (req, res) => res.send('API Live ✅'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Port: ${PORT}`));
