const responseLogger = (req, res, next) => {
  // Lấy giá trị turnOnLogger từ biến môi trường
  const turnOnLogger = process.env.TURN_ON_LOGGER === 'true';

  if (!turnOnLogger || req.originalUrl.startsWith('/api-docs')) {
    return next();
  }

  // Intercept hàm res.json để log dữ liệu trước khi trả về
  const originalJson = res.json;
  res.json = function (body) {
    if (!res._hasLogged) {
      console.log(`\n[API LOGGER] ${req.method} ${req.originalUrl}`);
      console.log('--- DATA TRẢ VỀ CHO USER ---');
      console.dir(body, { depth: null, colors: true });
      console.log('----------------------------\n');
      res._hasLogged = true; // Đánh dấu là đã log
    }
    
    // Gọi lại hàm res.json gốc để tiếp tục trả dữ liệu về frontend
    return originalJson.call(this, body);
  };

  // Tùy chọn: Intercept res.send (nếu API trả về text hoặc buffer thay vì json)
  const originalSend = res.send;
  res.send = function (body) {
    // Chỉ log nếu chưa gửi Header và chưa bị log bởi res.json
    if (!res.headersSent && !res._hasLogged && typeof body === 'string') {
        console.log(`\n[API LOGGER] ${req.method} ${req.originalUrl}`);
        console.log('--- DỮ LIỆU TRẢ VỀ CHO USER (TEXT) ---');
        console.log(body);
        console.log('--------------------------------------\n');
        res._hasLogged = true;
    }
    return originalSend.call(this, body);
  };

  next();
};

module.exports = responseLogger;
