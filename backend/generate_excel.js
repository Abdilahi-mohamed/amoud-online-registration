const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const ids = [
    '12345', '23456', '34567', '45678', '56789',
    '67890', '11223', '33445', '55667', '77889',
    '99001', '10203', '40506', '70809', '11111',
    '22222', '33333', '44444', '55555', '66666'
];

const rows = ids.map(id => ({
    ID: id,
    Password: (parseInt(id) * 2).toString()
}));

const worksheet = XLSX.utils.json_to_sheet(rows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

const filePath = path.join(dataDir, 'user_data.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`Excel file created at: ${filePath}`);
