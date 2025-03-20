function updateLogo() {
    const url = document.getElementById('logoUrl').value;
    const logoImg = document.getElementById('logoImg');
    if (url) {
        logoImg.src = url;
    } else {
        logoImg.src = "default-logo.png";
    }
}

async function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');

    if (fileInput.files.length === 0) {
        alert("Pilih file terlebih dahulu!");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    loading.style.display = "block";

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        loading.style.display = "none";
        result.innerHTML = `<p style="color:lightgreen;">${data.message} ✅</p><p>File URL: <a href="${data.filePath}" target="_blank">${data.filePath}</a></p>`;
    } catch (error) {
        loading.style.display = "none";
        result.innerHTML = `<p style="color:red;">Terjadi kesalahan!</p>`;
    }
}