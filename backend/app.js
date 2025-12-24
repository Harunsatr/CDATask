const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// Detect serverless environment
const isVercel = process.env.VERCEL === '1';

const app = express();

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in serverless/Vercel environment
      if (isVercel || !origin) {
        return callback(null, true);
      }
      if (config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Skip morgan logging in serverless to reduce cold start time
if (!isVercel) {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, vercel: isVercel });
});

// Mount routes - Vercel uses /api prefix in rewrites
app.use('/api', routes);
// Also mount at root for Vercel (since /api/* rewrites to /api)
app.use('/', routes);

app.use(errorHandler);

module.exports = app;
