const responseLogger = (req, res, next) => {
  // Get turnOnLogger value from environment variables
  const turnOnLogger = process.env.TURN_ON_LOGGER === 'true';

  if (!turnOnLogger || req.originalUrl.startsWith('/api-docs')) {
    return next();
  }

  // Intercept res.json to log data before returning
  const originalJson = res.json;
  res.json = function (body) {
    if (!res._hasLogged) {
      console.log(`\n[API LOGGER] ${req.method} ${req.originalUrl}`);
      console.log('--- DATA RETURNED TO USER ---');
      console.dir(body, { depth: null, colors: true });
      console.log('----------------------------\n');
      res._hasLogged = true; // Mark as logged
    }
    
    // Call original res.json to continue returning data to frontend
    return originalJson.call(this, body);
  };

  // Optional: Intercept res.send (if API returns text or buffer instead of json)
  const originalSend = res.send;
  res.send = function (body) {
    // Only log if Headers not sent and not already logged by res.json
    if (!res.headersSent && !res._hasLogged && typeof body === 'string') {
        console.log(`\n[API LOGGER] ${req.method} ${req.originalUrl}`);
        console.log('--- DATA RETURNED TO USER (TEXT) ---');
        console.log(body);
        console.log('--------------------------------------\n');
        res._hasLogged = true;
    }
    return originalSend.call(this, body);
  };

  next();
};

module.exports = responseLogger;
