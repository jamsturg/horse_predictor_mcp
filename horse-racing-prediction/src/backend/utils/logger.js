/**
 * Logger utility for Horse Racing Prediction Engine
 * Provides standardized logging functionality across the application
 */

const logger = {
  info: function(message, ...args) {
    console.log(`[INFO] ${message}`, ...args);
  },
  
  warn: function(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: function(message, ...args) {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: function(message, ...args) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

module.exports = logger;