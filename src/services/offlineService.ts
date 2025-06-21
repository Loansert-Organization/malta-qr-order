
interface OfflineOrder {
  id: string;
  vendorId: string;
  items: any[];
  totalPrice: number;
  customerInfo: any;
  timestamp: number;
  synced: boolean;
}

class OfflineService {
  private dbName = 'icupa-offline-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create orders store
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('timestamp', 'timestamp', { unique: false });
          ordersStore.createIndex('synced', 'synced', { unique: false });
        }
        
        // Create menu cache store
        if (!db.objectStoreNames.contains('menuCache')) {
          const menuStore = db.createObjectStore('menuCache', { keyPath: 'vendorId' });
          menuStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
        
        // Create layout cache store
        if (!db.objectStoreNames.contains('layoutCache')) {
          const layoutStore = db.createObjectStore('layoutCache', { keyPath: 'vendorId' });
          layoutStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
      };
    });
  }

  async saveOfflineOrder(order: Omit<OfflineOrder, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    if (!this.db) await this.init();
    
    const offlineOrder: OfflineOrder = {
      ...order,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const request = store.add(offlineOrder);
      
      request.onsuccess = () => resolve(offlineOrder.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineOrders(): Promise<OfflineOrder[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readonly');
      const store = transaction.objectStore('orders');
      const index = store.index('synced');
      const request = index.getAll(false);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markOrderSynced(orderId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const getRequest = store.get(orderId);
      
      getRequest.onsuccess = () => {
        const order = getRequest.result;
        if (order) {
          order.synced = true;
          const putRequest = store.put(order);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cacheMenuData(vendorId: string, menuData: any): Promise<void> {
    if (!this.db) await this.init();
    
    const cacheEntry = {
      vendorId,
      menuData,
      lastUpdated: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['menuCache'], 'readwrite');
      const store = transaction.objectStore('menuCache');
      const request = store.put(cacheEntry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedMenuData(vendorId: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['menuCache'], 'readonly');
      const store = transaction.objectStore('menuCache');
      const request = store.get(vendorId);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if cache is still fresh (24 hours)
          const isStale = Date.now() - result.lastUpdated > 24 * 60 * 60 * 1000;
          resolve(isStale ? null : result.menuData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearSynce dOrders(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const index = store.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineService = new OfflineService();
