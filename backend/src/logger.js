const logger = {
  info: (message) => console.log(`🔵 ${message}`),
  success: (message) => console.log(`🟢 ${message}`),
  warning: (message) => console.log(`🟠 ${message}`),
  error: (message) => console.log(`🔴 ${message}`),
  fatal: (message) => console.log(`⚫ ${message}`),
  debug: (message) => console.log(`⚪ ${message}`),
};

export default logger;
