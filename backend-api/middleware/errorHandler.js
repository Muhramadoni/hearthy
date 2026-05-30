const fs = require('fs');
const errorHandler = (err, req, res, next) => {
  const errMsg = `[ERROR] ${req.method} ${req.originalUrl} — ${err.message}\n${err.stack}\n\n`;
  console.error(errMsg);
  try { fs.appendFileSync('error_log.txt', errMsg); } catch(e) {}
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ status: 'error', message: 'A record with this value already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ status: 'error', message: 'Referenced record does not exist.' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ status: 'error', message: 'Invalid ID format.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
