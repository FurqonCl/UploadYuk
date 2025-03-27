const express = require("express");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

// Buat folder "uploads" kalau belum ada
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(uploadDir));
app.use(express.json({ limit: "10mb" })); // Terima JSON dengan ukuran max 10MB

// Konfigurasi multer untuk upload biasa
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const randomName = crypto.randomBytes(3).toString("hex");
        cb(null, `${randomName}${ext}`);
    }
});
const upload = multer({ storage });

// API Upload via JSON (Base64)
app.post("/api/upload/base64", (req, res) => {
    const { fileName, fileData } = req.body;

    if (!fileName || !fileData) {
        return res.status(400).json({ error: "Parameter fileName dan fileData wajib diisi!" });
    }

    // Buat nama file random
    const ext = path.extname(fileName);
    const randomName = crypto.randomBytes(3).toString("hex") + ext;
    const filePath = path.join(uploadDir, randomName);

    // Decode Base64 ke file asli
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFile(filePath, base64Data, { encoding: "base64" }, (err) => {
        if (err) {
            return res.status(500).json({ error: "Gagal menyimpan file!" });
        }

        res.json({
            success: true,
            message: "File berhasil diunggah!",
            filePath: `${req.protocol}://${req.get("host")}/uploads/${randomName}`
        });
    });
});

// API Upload via FormData (untuk backup)
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Tidak ada file yang diunggah!" });
    }
    res.json({
        success: true,
        message: "File berhasil diunggah!",
        filePath: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
