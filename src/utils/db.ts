// src/utils/db.ts

const DB_NAME = "GurukulDB";
const DB_VERSION = 1;

/**
 * 1. ડેટાબેઝ ઓપન કરવા અને ટેબલ (Store) ચેક કરવા માટેનું પ્રાઇવેટ ફંક્શન
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // જો ડેટાબેઝ પહેલીવાર બને કે વર્ઝન અપડેટ થાય ત્યારે જ આ રન થશે
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      // 'admins' ટેબલ બનાવો
      if (!db.objectStoreNames.contains("admins")) {
        db.createObjectStore("admins", { keyPath: "id", autoIncrement: true });
      }
      
      // ભવિષ્યમાં જો 'sevaks' કે 'departments' નું ટેબલ ઉમેરવું હોય તો અહીં ઉમેરી શકાય:
      // if (!db.objectStoreNames.contains("sevaks")) { ... }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

/**
 * 2. ડેટા સ્ટોર (Save) કરવા માટેનું ગ્લોબલ ફંક્શન
 * @param storeName ટેબલનું નામ (જેમ કે: 'admins')
 * @param data જે ઓબ્જેક્ટ ડેટા સેવ કરવો છે તે
 */
export const addData = async (storeName: "admins", data: any): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`IndexedDB માં ડેટા એડ કરવામાં ભૂલ આવી (${storeName}):`, error);
    return false;
  }
};

/**
 * 3. ડેટાબેઝમાંથી બધો જ ડેટા મેળવવા (Fetch/Get) માટેનું ફંક્શન
 * @param storeName ટેબલનું નામ
 */
export const getAllData = async (storeName: "admins"): Promise<any[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`IndexedDB માંથી ડેટા મેળવવામાં ભૂલ આવી (${storeName}):`, error);
    return [];
  }
};