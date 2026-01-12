// src/core/logger.js

const icons = {
  info:    "🔵",
  success: "🟢",
  warn:    "🟠",
  error:   "🔴",
  fatal:   "⚫",
};

function log(type, message) {
  const time = new Date().toISOString();
  console.log(`${time} ${icons[type]} [${type.toUpperCase()}] ${message}`);
}

export default {
  info:    msg => log("info", msg),
  success: msg => log("success", msg),
  warn:    msg => log("warn", msg),
  error:   msg => log("error", msg),
  fatal:   msg => log("fatal", msg),
};
