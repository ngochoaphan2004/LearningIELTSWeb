require('dotenv').config();
const prisma = require('../src/config/prisma');
const xlsx = require('xlsx');
const path = require('path');

async function main() {
  const filePath = 'C:\\Users\\phann\\Downloads\\New folder (7)\\Học IELTS.xlsx';
  console.log(`Reading Excel file from: ${filePath}`);
  
  const workbook = xlsx.readFile(filePath);
  const sheetName = 'Lộ Trình 16 Tuần';
  if (!workbook.Sheets[sheetName]) {
    throw new Error(`Sheet "${sheetName}" not found in Excel file`);
  }
  
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`Found ${data.length} rows in "${sheetName}".`);

  // Create the Course
  const course = await prisma.course.create({
    data: {
      title: 'Học IELTS cùng Hòa (16 ngày)',
      description: 'Lộ trình chi tiết từng ngày trích xuất từ file Excel, giúp bạn nắm vững kiến thức 4 kỹ năng.',
      total_days: data.length,
      focus_skill: 'All Skills',
      total_duration: `${data.length} Giờ`,
      thumbnail_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'
    }
  });

  console.log(`Created Course: ${course.title} (ID: ${course.id})`);

  let dayCounter = 1;
  const sessions = [];

  for (const row of data) {
    // Tên bài học (Title): Lấy kết hợp Tuần và Thứ nếu có, hoặc chỉ Thứ
    let title = row['Thứ'] || `Day ${dayCounter}`;
    if (row['Tuần']) {
      title = `${row['Tuần']} - ${title}`;
    }

    const session = await prisma.studySession.create({
      data: {
        courseId: course.id,
        title: title,
        day_number: dayCounter,
        focus_skill: row['Kỹ năng trọng tâm'] || 'Tự ôn tập',
        activity_description: row['Hoạt động (60 Phút)'] || 'Không có mô tả',
        duration_minutes: 60,
        reference_pdfs: row['Tài liệu tham khảo (trong PDF)'] ? [row['Tài liệu tham khảo (trong PDF)']] : []
      }
    });

    sessions.push(session);
    dayCounter++;
  }

  console.log(`Created ${sessions.length} sessions for the course!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
