const xlsx = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\phann\\Downloads\\New folder (7)\\Học IELTS.xlsx';
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const sheetNames = workbook.SheetNames;
  console.log("Sheet names:", sheetNames);
  if (sheetNames.length > 1) {
    const sheet2 = workbook.Sheets[sheetNames[1]];
    const data2 = xlsx.utils.sheet_to_json(sheet2);
    console.log("Data from Sheet 2:");
    console.log(JSON.stringify(data2.slice(0, 5), null, 2));
  } else {
    console.log("Only 1 sheet found.");
  }
} catch (err) {
  console.error("Error reading file:", err);
}
