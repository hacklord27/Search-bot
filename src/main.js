const puppeteer = require('puppeteer');
const path = require('path');
const { readPreviousUrls, savePreviousUrls, saveResultsToFile } = require('./utils');

// Hàm tìm kiếm Google
const googleSearch = async (query, numResults = 10) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const urls = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors
            .map((a) => a.href)
            .filter((href) => href.startsWith('http') && !href.includes('googleusercontent') && !href.includes('/search'));
    });

    await browser.close();
    return urls;
};

// Hàm kiểm tra bán hàng online
const checkOnlineShopping = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const pageContent = await page.content();
        const keywords = ['đặt hàng', 'mua hàng', 'thanh toán', 'giỏ hàng', 'checkout'];
        return keywords.some((keyword) => pageContent.toLowerCase().includes(keyword));
    } catch (err) {
        console.error(`Không thể truy cập URL: ${url}`);
        return false;
    } finally {
        await browser.close();
    }
};

// Chương trình chính
(async () => {
    const industry = process.argv[2] || 'mỹ phẩm'; // Ngành nghề
    const location = process.argv[3] || 'Hồ Chí Minh'; // Địa chỉ
    const query = `${industry} ${location}`;

    console.log(`Đang tìm kiếm với từ khóa: "${query}"...`);

    // Lấy danh sách URL từ Google
    const newUrls = await googleSearch(query, 50);

    // Lọc URL không trùng lặp
    const previousUrls = readPreviousUrls();
    const filteredUrls = newUrls.filter((url) => !previousUrls.includes(url));

    console.log(`Tìm thấy ${filteredUrls.length} URL mới.`);

    // Kiểm tra bán hàng online
    const onlineShoppingUrls = [];
    for (const url of filteredUrls) {
        const hasShopping = await checkOnlineShopping(url);
        if (hasShopping) {
            onlineShoppingUrls.push(url);
            console.log(`URL có bán hàng online: ${url}`);
        }
    }

    if (onlineShoppingUrls.length > 0) {
        // Lưu kết quả
        const outputFile = path.join(__dirname, 'output', 'output_urls.csv');
        saveResultsToFile(onlineShoppingUrls, outputFile);

        // Cập nhật danh sách URL cũ
        savePreviousUrls([...previousUrls, ...onlineShoppingUrls]);

        console.log(`Danh sách URL có bán hàng online đã được lưu vào: ${outputFile}`);
    } else {
        console.log('Không có URL nào có chức năng bán hàng online.');
    }
})();
