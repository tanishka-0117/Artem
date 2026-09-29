import app from './app.js';
import config from './config/index.js';
import { connectDB } from './config/database.js';

async function start() {
  // Connect to MongoDB
  await connectDB();

  // Start server
  app.listen(config.port, () => {
    console.log(`\n  ✦  Artem API Server`);
    console.log(`     Environment: ${config.nodeEnv}`);
    console.log(`     Port:        ${config.port}`);
    console.log(`     Frontend:    ${config.frontendUrl}\n`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
