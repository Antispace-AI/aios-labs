//@ts-nocheck
// Simple key-value store for local data with localStorage persistence
const store = {};

// Initialize store from localStorage if available
try {
  if (typeof localStorage !== 'undefined') {
    const savedData = localStorage.getItem('wikipedia_local_db');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      Object.assign(store, parsed);
      console.log('Loaded data from localStorage');
    }
  }
} catch (e) {
  console.error('Failed to load data from localStorage:', e);
}

// Helper function to save to localStorage
const saveToStorage = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wikipedia_local_db', JSON.stringify(store));
    }
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
};

export default {
  async get(key) {
    return store[key];
  },
  async set(key, value) {
    store[key] = value;
    saveToStorage();
    return value;
  },
  async delete(key) {
    const value = store[key];
    delete store[key];
    saveToStorage();
    return value;
  }
}; 