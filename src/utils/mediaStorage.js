// IndexedDB Video Storage for local files uploaded by Teacher / Admin
const DB_NAME = 'CodeCraftMediaDB_v1';
const DB_VERSION = 1;
const STORE_NAME = 'video_files';

const urlCache = new Map();

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves a video File / Blob into IndexedDB and caches its object URL
 * @param {string} id Unique identifier for the video
 * @param {File|Blob} file File or Blob object from <input type="file">
 * @returns {Promise<string>} Returns the object URL for immediate playback
 */
export async function saveVideoFile(id, file) {
  if (!id || !file) return null;
  const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  const objectUrl = URL.createObjectURL(file);
  urlCache.set(cleanId, objectUrl);

  // Upload to backend server so other browsers (Student / Chrome / Mobile) can also stream it
  fetch(`/api/media/upload?id=${encodeURIComponent(cleanId)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'video/mp4' },
    body: file
  }).catch(() => {});

  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data = {
        id: cleanId,
        name: file.name || 'video.mp4',
        type: file.type || 'video/mp4',
        size: file.size || 0,
        blob: file,
        savedAt: Date.now()
      };
      const putReq = store.put(data);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.warn('Could not persist video in IndexedDB (session cache will be used):', err);
  }

  return `/api/media/${cleanId}`;
}

/**
 * Retrieves a playable video URL for the given video ID
 * @param {string} id
 * @returns {Promise<string|null>}
 */
export async function getVideoUrl(id) {
  if (!id) return null;
  const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  if (urlCache.has(cleanId)) {
    return urlCache.get(cleanId);
  }

  try {
    const db = await openDB();
    const localUrl = await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const url = URL.createObjectURL(req.result.blob);
          urlCache.set(cleanId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
    if (localUrl) return localUrl;
  } catch {
    // ignore
  }

  // Fallback to server-hosted video URL for cross-browser playback
  return `/api/media/${cleanId}`;
}

// Automatically sync any locally stored IndexedDB videos to the backend server
if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
  setTimeout(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        items.forEach((item) => {
          if (item && item.id && item.blob) {
            const cleanId = String(item.id).replace(/[^a-zA-Z0-9_-]/g, '');
            fetch(`/api/media/upload?id=${encodeURIComponent(cleanId)}`, {
              method: 'POST',
              headers: { 'Content-Type': item.type || 'video/mp4' },
              body: item.blob
            }).catch(() => {});
          }
        });
      };
    } catch {
      // ignore
    }
  }, 1500);
}

/**
 * Removes a video from IndexedDB and revokes object URL
 * @param {string} id
 */
export async function deleteVideoFile(id) {
  if (!id) return;
  if (urlCache.has(id)) {
    try {
      URL.revokeObjectURL(urlCache.get(id));
    } catch {}
    urlCache.delete(id);
  }
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch {}
}
