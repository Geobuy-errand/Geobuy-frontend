// Custom storage for redux-persist that works with Vite
export const createStorage = () => {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    
    if (!isBrowser) {
      // Server-side fallback (for SSR)
      return {
        getItem: (_key) => Promise.resolve(null),
        setItem: (_key, _value) => Promise.resolve(),
        removeItem: (_key) => Promise.resolve(),
      };
    }
    
    return {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          return Promise.resolve(value);
        } catch (err) {
          console.warn('Error reading from localStorage:', err);
          return Promise.resolve(null);
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (err) {
          console.warn('Error writing to localStorage:', err);
          return Promise.resolve();
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch (err) {
          console.warn('Error removing from localStorage:', err);
          return Promise.resolve();
        }
      },
    };
  };