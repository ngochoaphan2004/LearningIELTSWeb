require('dotenv').config();
const prisma = require('./src/config/prisma');

async function main() {
  console.log("Đang tạo khóa học mẫu để test...");

  // Create new course
  const course = await prisma.course.create({
    data: {
      title: 'Khóa học Test Siêu Tốc',
      description: 'Khóa học này dùng để test tính năng đếm ngược. Mỗi buổi học chỉ kéo dài 1 phút.',
      total_days: 10,
      focus_skill: 'Testing',
      total_duration: '10 Phút',
      thumbnail_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800'
    }
  });

  console.log(`Đã tạo Khóa học: ${course.title} (ID: ${course.id})`);

  const sessions = [];

  for (let i = 1; i <= 10; i++) {
    const session = await prisma.studySession.create({
      data: {
        courseId: course.id,
        title: `Test Session ${i}`,
        day_number: i,
        week_number: 1, // Set to week 1 for easy viewing
        focus_skill: 'Kỹ năng Test',
        activity_description: 'Vào test nhanh xem đếm ngược 1 phút có hoạt động đúng không nhé.',
        duration_minutes: 1, // Lasts 1 minute
        reference_pdfs: [],
        embedded_url: 'https://drive.google.com/file/d/1cOMsNxYvaidbVdfEOGzWMuPDTI3t456f/preview'
      }
    });
    sessions.push(session);
  }

  console.log(`Hoàn tất! Đã tạo thành công ${sessions.length} buổi học 1 phút.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
