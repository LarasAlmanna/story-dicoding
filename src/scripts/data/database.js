const DB_NAME = "dicoding-story-db";
const DB_VERSION = 1;
const OBJECT_STORE_NAME = "stories";
const BOOKMARK_STORE_NAME = "bookmarked-stories";

class Database {
  constructor() {
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        reject("Database error: " + event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          const store = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
        if (!db.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
          const store = db.createObjectStore(BOOKMARK_STORE_NAME, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });
  }

  async putStory(story) {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], "readwrite");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllStories() {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], "readonly");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getStoryById(id) {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], "readonly");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteStory(id) {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], "readwrite");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllStories() {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], "readwrite");
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async putBookmarkedStory(story) {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BOOKMARK_STORE_NAME], "readwrite");
      const store = transaction.objectStore(BOOKMARK_STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBookmarkedStories() {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BOOKMARK_STORE_NAME], "readonly");
      const store = transaction.objectStore(BOOKMARK_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBookmarkedStoryById(id) {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BOOKMARK_STORE_NAME], "readonly");
      const store = transaction.objectStore(BOOKMARK_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBookmarkedStory(id) {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BOOKMARK_STORE_NAME], "readwrite");
      const store = transaction.objectStore(BOOKMARK_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllBookmarkedStories() {
    if (!this.db) await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([BOOKMARK_STORE_NAME], "readwrite");
      const store = transaction.objectStore(BOOKMARK_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const database = new Database();
export default database;
