const fs = require('fs');
const path = require('path');

const replacements = [
  { from: "// 1. Xác thực idToken qua Firebase", to: "// 1. Verify idToken via Firebase" },
  { from: "// 2. Cập nhật hoặc tạo mới User trong CSDL Postgres", to: "// 2. Update or create User in Postgres DB" },
  { from: "// Cập nhật lại tên/avatar nếu có thay đổi từ Google", to: "// Update name/avatar if changed from Google" },
  { from: "// Lấy toàn bộ tiến độ của user để tô màu Calendar", to: "// Get all user progress to color the Calendar" },
  { from: "// Tìm bài học tiếp theo (bài học chưa hoàn thành có day_number nhỏ nhất)", to: "// Find next lesson (incomplete lesson with smallest day_number)" },
  { from: "// Giả lập Streak hiện tại bằng tổng số bài hoàn thành", to: "// Simulate current Streak with total completed lessons" },
  { from: "// Lấy danh sách user kèm theo tổng số bài đã hoàn thành", to: "// Get user list with total completed lessons" },
  { from: "// Sắp xếp giảm dần theo số bài hoàn thành", to: "// Sort descending by completed lessons" },
  { from: "// Lấy Top 50", to: "// Get Top 50" },
  { from: "// Lắng nghe trạng thái đăng nhập từ Firebase (tự động nhớ trạng thái kể cả khi F5)", to: "// Listen to Firebase auth state (auto remember state even on F5)" },
  { from: "// Hủy lắng nghe khi component unmount", to: "// Unsubscribe when component unmounts" },
  { from: "// Màn hình chờ siêu tốc trong lúc Firebase kiểm tra Cookie/IndexedDB", to: "// Fast loading screen while Firebase checks Cookie/IndexedDB" },
  { from: "// Khởi tạo Firebase", to: "// Initialize Firebase" },
  { from: "// Bước 1: Mở popup cho người dùng đăng nhập bằng tài khoản Google", to: "// Step 1: Open popup for user to login with Google account" },
  { from: "// Lấy idToken từ Firebase", to: "// Get idToken from Firebase" },
  { from: "// Đăng nhập thành công, App.jsx sẽ tự động call API sync và đổi trạng thái", to: "// Login successful, App.jsx will automatically call sync API and change state" },
  { from: "// Nhóm các bài học theo Tuần", to: "// Group lessons by Week" },
  { from: "/* Premium Ed-Tech Theme (Sáng sủa, thân thiện, dễ tập trung) */", to: "/* Premium Ed-Tech Theme (Bright, friendly, easy to focus) */" },
  { from: "/* Xanh dương dịu mắt (Calm Blue) */", to: "/* Calm Blue */" },
  { from: "/* Xanh lá tích cực */", to: "/* Positive Green */" },
  { from: "/* Đỏ cảnh báo nhẹ */", to: "/* Light Warning Red */" },
  { from: "/* Cam rực rỡ */", to: "/* Vibrant Orange */" },
  { from: "/* Màu trắng tinh */", to: "/* Pure White */" },
  { from: "/* Màu xám đậm hơn một chút để dễ đọc */", to: "/* Darker gray for readability */" },
  { from: "/* Có đường viền (border) nhạt */", to: "/* Light border */" },
  { from: "/* Nền xanh lá nhạt */", to: "/* Light green background */" },
  { from: "/* Nền đỏ nhạt */", to: "/* Light red background */" }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const rep of replacements) {
    if (content.includes(rep.from)) {
      content = content.split(rep.from).join(rep.to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'backend'));
walkDir(path.join(__dirname, 'web'));
console.log('Done!');
