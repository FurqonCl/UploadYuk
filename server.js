const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
if (!fs.existsSync('./db')) fs.mkdirSync('./db');
const DB_FILE = './db/files.json';
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }
});

app.use(express.static('public'));
app.use(express.json());

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload.' });

  const filename = req.file.filename;
  const filepath = `/uploads/${filename}`;
  const now = new Date().toISOString();

  let files = [];
  try {
    files = JSON.parse(fs.readFileSync(DB_FILE));
  } catch (e) {
    files = [];
  }

  const fileInfo = {
    filename,
    originalname: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
    uploaded_at: now,
    url_direct: `http://localhost:${PORT}${filepath}`,
    url_page: `http://localhost:${PORT}/file/${filename}`
  };

  files.push(fileInfo);
  fs.writeFileSync(DB_FILE, JSON.stringify(files, null, 2));

  res.json({
    message: 'File berhasil diupload!',
    ...fileInfo
  });
});

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  const ext = path.extname(filename).toLowerCase();

  if (!fs.existsSync(filepath)) {
    return res.status(404).send('File tidak ditemukan');
  }

  if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) {
    res.sendFile(filepath);
  } else {
    res.download(filepath, filename);
  }
});

app.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).send('File tidak ditemukan');
  }

  const ext = path.extname(filename).toLowerCase();
  const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);

  if (isImage) {
    return res.redirect(`/uploads/${filename}`);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Download File - UploadYuk</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet" />
    </head>
    <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen px-4">
      <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-lg text-center space-y-4">
        <h1 class="text-xl font-bold">Download File</h1>
        <p class="text-gray-400 break-all">${filename}</p>
        <a href="/uploads/${filename}" download class="inline-block mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition">
          Download Sekarang
        </a>
      </div>
    </body>
    </html>
  `);
});

app.use((req, res, next) => {
    res.status(404).sendFile(process.cwd() + "/public/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(process.cwd() + "/public/500.html");
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});