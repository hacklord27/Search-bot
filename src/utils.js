const fs = require('fs');
const path = require('path');

const PROCESSED_URLS_FILE = path.join(__dirname, 'processed_urls.json');

// Đọc danh sách URL đã xử lý
const readPreviousUrls = () => {
    if (fs.existsSync(PROCESSED_URLS_FILE)) {
        return JSON.parse(fs.readFileSync(PROCESSED_URLS_FILE, 'utf8'));
    }
    return [];
};

// Lưu danh sách URL đã xử lý
const savePreviousUrls = (urls) => {
    fs.writeFileSync(PROCESSED_URLS_FILE, JSON.stringify(urls, null, 2), 'utf8');
};

// Lưu kết quả vào file CSV
const saveResultsToFile = (urls, outputPath) => {
    const data = urls.join('\n');
    const outputDir = path.dirname(outputPath);

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, data, 'utf8');
};

module.exports = { readPreviousUrls, savePreviousUrls, saveResultsToFile };
