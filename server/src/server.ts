import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { reapStaleRunsOnBoot } from './services/generation.service';

const startServer = async () => {
  try {
    // 1. Connect database FIRST before anything else
    await connectDatabase();

    // 2. Fail any generation runs left 'running' by a previous (now-dead)
    //    process — generation runs in-process, so none can survive a restart.
    try {
      const reaped = await reapStaleRunsOnBoot();
      if (reaped > 0) console.log(`Reaped ${reaped} stale generation run(s) from a previous process.`);
    } catch (err) {
      console.error('Stale-run reaper failed (non-fatal):', err);
    }

    const app = createApp();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});
