// src/index.js

import 'dotenv/config';
import main from './main.js';
import { logger } from './core/logger.js';

main().catch(err => {
  logger.error('Fatal error starting the application');
  logger.error(err.stack ?? err.message);
  process.exit(1);
});
