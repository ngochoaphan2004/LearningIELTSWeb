require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Bắt đầu tạo dữ liệu mẫu (Seeding)...");

  // Xóa dữ liệu cũ nếu có
  await prisma.feedActivity.deleteMany();
  await prisma.userSessionProgress.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.user.deleteMany();

  // 1. Tạo 2 User mẫu
  const user1 = await prisma.user.create({
    data: {
      name: "Nam Nguyễn",
      email: "nam.nguyen@example.com",
      avatar_url: "N",
      current_level: 5.5,
      target_score: 7.0
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Hòa Phan",
      email: "hoa.phan@example.com",
      avatar_url: "H",
      current_level: 6.0,
      target_score: 8.0
    }
  });

  console.log("✅ Đã tạo Users.");

  // 2. Tạo một Lộ trình (Roadmap)
  const roadmap = await prisma.roadmap.create({
    data: {
      title: "Lộ trình IELTS 5.0 - 7.0 Cấp tốc (30 Ngày)"
    }
  });

  console.log("✅ Đã tạo Roadmap.");

  // 3. Tạo các buổi học (Study Sessions) cho Lộ trình
  const sessions = [];
  for (let i = 1; i <= 30; i++) {
    sessions.push({
      roadmapId: roadmap.id,
      title: `Ngày ${i}: ${i % 2 === 0 ? 'Reading & Listening' : 'Writing & Speaking'}`,
      day_number: i,
      focus_skill: i % 2 === 0 ? "Reading" : "Writing",
      activity_description: `Hoạt động thực hành kỹ năng chuyên sâu cho ngày ${i}.`,
      reference_pdfs: [`Day${i}_Material.pdf`]
    });
  }

  const createdSessions = await prisma.studySession.createManyAndReturn({
    data: sessions
  });

  console.log(`✅ Đã tạo ${createdSessions.length} Study Sessions.`);

  // 4. Tạo lịch sử chuyên cần (Session Progress) cho User 1
  // Giả sử User 1 đang ở ngày 15. Đã học 13 ngày đầu, lỡ ngày 14, ngày 15 đang mở.
  const progressData = [];
  
  for (let i = 0; i < 15; i++) {
    let status = "LOCKED";
    if (i < 13) status = "COMPLETED";
    else if (i === 13) status = "MISSED"; // Ngày 14
    else if (i === 14) status = "IN_PROGRESS"; // Ngày 15 (Hôm nay)

    progressData.push({
      userId: user1.id,
      sessionId: createdSessions[i].id,
      status: status,
      scheduled_date: new Date(new Date().setDate(new Date().getDate() - (14 - i))), // Lùi ngày
      completed_at: status === "COMPLETED" ? new Date(new Date().setDate(new Date().getDate() - (14 - i))) : null
    });
  }

  await prisma.userSessionProgress.createMany({ data: progressData });
  console.log("✅ Đã tạo Progress cho User.");

  // 5. Tạo vài hoạt động Bảng tin (Feed Activities)
  await prisma.feedActivity.createMany({
    data: [
      {
        userId: user1.id,
        action_type: "STREAK",
        content: "vừa đạt chuỗi 13 ngày học liên tục! 🔥",
        created_at: new Date(new Date().setMinutes(new Date().getMinutes() - 30))
      },
      {
        userId: user2.id,
        action_type: "COMPLETED",
        content: "xuất sắc hoàn thành bài Test Reading Cam 18.",
        created_at: new Date(new Date().setHours(new Date().getHours() - 2))
      }
    ]
  });

  console.log("✅ Đã tạo Bảng tin cộng đồng (Feed).");
  console.log("\n🎉 SEEDING HOÀN TẤT!");
  console.log(`ID CỦA BẠN (Dùng để test API): ${user1.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
