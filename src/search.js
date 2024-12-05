const axios = require("axios");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Thay API_KEY và CX bằng giá trị của bạn
const API_KEY = "AIzaSyBRdnIDkJWzWI2lotWEbrEKSHFXxE3zQ5U";
const CX = "13bb74cfa19484c23";

// Hàm tìm kiếm Google
// Thêm bộ lọc để kiểm tra website có chức năng đặt hàng online
function filterOrderWebsites(results) {
  const orderKeywords = [
    "đặt hàng", "mua hàng", "thanh toán", "giỏ hàng", "checkout", 
    "order", "cart", "add to cart", "payment"
  ];
  
  return results.filter((item) => {
    const { title = "", snippet = "", link = "" } = item;
    
    // Kiểm tra từ khóa trong tiêu đề, mô tả, hoặc URL
    return orderKeywords.some((keyword) => 
      title.toLowerCase().includes(keyword) ||
      snippet.toLowerCase().includes(keyword) ||
      link.toLowerCase().includes(keyword)
    );
  });
}

// Hàm tìm kiếm Google (cập nhật để lọc kết quả)
async function googleSearch(keyword, location, excludedUrls) {
  const query = `${keyword} ${location}`;
  const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&key=${API_KEY}&cx=${CX}`;

  try {
    const response = await axios.get(apiUrl);
    const results = response.data.items || [];

    // Lọc bỏ URL đã tồn tại trong excludedUrls
    const filteredResults = results.filter((item) => !excludedUrls.includes(item.link));

    // Lọc các website có chức năng đặt hàng online
    const orderWebsites = filterOrderWebsites(filteredResults);

    // Trả về danh sách URL
    return orderWebsites.map((item) => item.link);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.message);
    return [];
  }
}


// Hàm ghi danh sách URL vào file CSV
async function writeUrlsToCsv(fileName, urls) {
  const csvWriter = createCsvWriter({
    path: fileName,
    header: [{ id: "url", title: "URL" }],
  });

  const records = urls.map((url) => ({ url }));
  await csvWriter.writeRecords(records);
  console.log(`Đã ghi ${urls.length} URL vào file ${fileName}`);
}

// Chương trình chính
(async () => {
  const keyword = "điện thoại"; // Nhập ngành nghề
  const location = "Hồ Chí Minh"; // Nhập địa chỉ
  const outputFileName = "order_websites.csv"; // File xuất
  const previousUrlsFile = "excluded_urls.json"; // File lưu URL đã tìm

  // Đọc URL đã tìm trước đó
  let excludedUrls = [];
  if (fs.existsSync(previousUrlsFile)) {
    excludedUrls = JSON.parse(fs.readFileSync(previousUrlsFile, "utf8"));
  }

  // Gọi hàm tìm kiếm
  const newUrls = await googleSearch(keyword, location, excludedUrls);

  if (newUrls.length > 0) {
    // Ghi URL mới vào CSV
    await writeUrlsToCsv(outputFileName, newUrls);

    // Cập nhật danh sách URL đã tìm vào file JSON
    excludedUrls = [...excludedUrls, ...newUrls];
    fs.writeFileSync(previousUrlsFile, JSON.stringify(excludedUrls, null, 2));

    console.log(`Đã lọc và ghi ${newUrls.length} URL có chức năng đặt hàng vào file ${outputFileName}`);
  } else {
    console.log("Không tìm thấy URL mới hoặc không có chức năng đặt hàng.");
  }
})();

