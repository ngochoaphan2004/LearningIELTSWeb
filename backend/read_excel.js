require('dotenv').config();
const prisma = require('./src/config/prisma');
const xlsx = require('xlsx');

async function main() {
  const filePath = 'C:\\Users\\phann\\Downloads\\New folder (7)\\Học IELTS.xlsx';
  console.log(`Đang đọc file Excel từ: ${filePath}`);

  const workbook = xlsx.readFile(filePath);
  const sheetName = 'Lộ Trình 16 Tuần';

  if (!workbook.Sheets[sheetName]) {
    throw new Error(`Không tìm thấy sheet "${sheetName}" trong file Excel.`);
  }

  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Tìm thấy ${data.length} dòng dữ liệu trong "${sheetName}".`);

  // Create the Course
  const course = await prisma.course.create({
    data: {
      title: 'Học IELTS cùng Hòa (16 tuần)',
      description: 'Lộ trình chi tiết từng ngày trích xuất từ file Excel, giúp bạn nắm vững kiến thức 4 kỹ năng.',
      total_days: data.length,
      focus_skill: 'All Skills',
      total_duration: `${data.length} Giờ`,
      thumbnail_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'
    }
  });

  console.log(`Đã tạo Khóa học: ${course.title} (ID: ${course.id})`);

  let dayCounter = 1;
  const sessions = [];
  let pre_day_of_week = 1;
  for (const row of data) {
    let title = row['Thứ'] || `Day ${dayCounter}`;

    let week_number = 1;
    if (row['Tuần']) {
      const match = String(row['Tuần']).match(/\d+/);
      if (match) {
        week_number = parseInt(match[0], 10);
        pre_day_of_week = week_number
      }
    }
    else {
      week_number = pre_day_of_week;
    }

    const session = await prisma.studySession.create({
      data: {
        courseId: course.id,
        title: title,
        day_number: dayCounter,
        week_number: week_number,
        focus_skill: row['Kỹ năng trọng tâm'] || 'Tự ôn tập',
        activity_description: row['Hoạt động (60 Phút)'] || 'Không có mô tả',
        duration_minutes: 60,
        reference_pdfs: row['Tài liệu tham khảo (trong PDF)'] ? [row['Tài liệu tham khảo (trong PDF)']] : [],
        embedded_url: row['Link'] ? [row['Link']] : [],
      }
    });

    sessions.push(session);
    dayCounter++;
  }

  console.log(`Hoàn tất! Đã import thành công ${sessions.length} bài học vào khóa học.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
