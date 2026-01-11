// src/core/logger.js

const isProd = process.env.NODE_ENV === 'production';

const icons = isProd
  ? { info: '', success: '', warn: '', error: '', shutdown: '' }
  : {
      info: '🔵',
      success: '🟢',
      warn: '🟠',
      error: '🔴',
      shutdown: '⚫'
    };

export const logger = {
  info: msg => console.log(`${icons.info} ${msg}`.trim()),
  success: msg => console.log(`${icons.success} ${msg}`.trim()),
  warn: msg => console.warn(`${icons.warn} ${msg}`.trim()),
  error: msg => console.error(`${icons.error} ${msg}`.trim()),
  shutdown: msg => console.log(`${icons.shutdown} ${msg}`.trim())
};