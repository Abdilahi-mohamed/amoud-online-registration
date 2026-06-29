const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'user_data.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const users = XLSX.utils.sheet_to_json(worksheet);

console.log(JSON.stringify(users.slice(0, 5), null, 2));
console.log(`Total users: ${users.length}`);
