/**
 * Logger utility for MyTab
 * Suppresses logs in production mode to keep the console clean.
 */
const isDev = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Errors are generally useful to see even in production, 
    // but you can restrict this if preferred.
    console.error(...args);
  },
};
