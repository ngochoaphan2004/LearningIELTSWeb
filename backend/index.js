require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');
const { swaggerUi, specs } = require('./src/config/swagger');
const responseLogger = require('./src/middlewares/logger.middleware');

const app = express();

app.use(cors()); // Không cần gửi Cookie nữa, có thể bỏ options cors
app.use(express.json());

// Gắn Logger Middleware (Sẽ log nếu TURN_ON_LOGGER=true)
app.use(responseLogger);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Main API routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 IELTS Backend Server is running on http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
