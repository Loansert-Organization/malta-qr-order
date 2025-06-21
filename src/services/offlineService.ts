
class OfflineService {
  private dbName = 'icupa-offline-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores
        if (!db.objectStoreNames.contains('vendors')) {
          db.createObjectStore('vendors', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('menus')) {
          db.createObjectStore('menus', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
      };
    });
  }

  async cacheVendorData(vendorId: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['vendors'], 'readwrite');
    const store = transaction.objectStore('vendors');
    await store.put({ id: vendorId, data, timestamp: Date.now() });
  }

  async getCachedVendorData(vendorId: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['vendors'], 'readonly');
      const store = transaction.objectStore('vendors');
      const request = store.get(vendorId);
      
      request.onsuccess = () => {
        resolve(request.result?.data);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async cacheOrder(order: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    await store.put({ ...order, timestamp: Date.now(), synced: false });
  }

  async getPendingOrders(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readonly');
      const store = transaction.objectStore('orders');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const orders = request.result.filter(order => !order.synced);
        resolve(orders);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
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
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async syncPendingData(): Promise<void> {
    if (!this.isOnline()) return;
    
    const pendingOrders = await this.getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        // Sync order to server (implement actual sync logic)
        console.log('Syncing order:', order.id);
        await this.markOrderSynced(order.id);
      } catch (error) {
        console.error('Failed to sync order:', order.id, error);
      }
    }
  }
}

export const offlineService = new OfflineService();
