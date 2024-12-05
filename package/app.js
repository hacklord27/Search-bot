document.getElementById('searchBtn').addEventListener('click', async () => {
    const industry = document.getElementById('industry').value;
    const location = document.getElementById('location').value;
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    
    if (!industry || !location) {
        alert('Vui lòng nhập đầy đủ ngành nghề và địa chỉ!');
        return;
    }

    try {
        // Gửi yêu cầu đến backend để lấy kết quả tìm kiếm
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ industry, location }),
        });

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            // Hiển thị kết quả trong bảng
            resultsTableBody.innerHTML = ''; // Xóa bảng cũ
            data.results.forEach((result) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${industry}</td>
                    <td>${location}</td>
                    <td><a href="${result.link}" target="_blank">${result.title}</a></td>
                `;
                resultsTableBody.appendChild(row);
            });
        } else {
            alert('Không có kết quả nào.');
        }
    } catch (error) {
        alert('Đã có lỗi xảy ra!');
        console.error(error);
    }
});


const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyAvbVFdj4GTK3jr9N-VaV1qDdYTlw1FtgE'; // Thay bằng API Key của bạn
const CX = 'YOUR_CUSTOM_SEARCH_ENGINE_ID'; // Thay bằng ID Custom Search Engine của bạn

const searchGoogle = async (query, location) => {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: CX,
                q: `${query} ${location}`,
            },
        });

        return response.data.items || [];
    } catch (error) {
        console.error('Error fetching Google results:', error);
        return [];
    }
};

const displayResults = async () => {
    const industry = 'mỹ phẩm'; // Ví dụ: ngành nghề bạn tìm kiếm
    const location = 'Hồ Chí Minh'; // Ví dụ: địa chỉ bạn tìm kiếm

    const results = await searchGoogle(industry, location);
    
    if (results.length === 0) {
        console.log('Không tìm thấy kết quả.');
        return;
    }

    // Hiển thị kết quả
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`URL: ${result.link}`);
        console.log('--------------------------------------');
    });
};

displayResults();
