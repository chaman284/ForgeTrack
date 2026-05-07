import XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:\\Users\\Chaman\\OneDrive\\Desktop\\KineticForge\\docs\\Data Engineering and AI - Actual Program (1).xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Log first 10 rows to see structure
    data.slice(0, 10).forEach((row, i) => {
      console.log(`Row ${i}:`, row);
    });
  });
} catch (error) {
  console.error('Error reading file:', error);
}
