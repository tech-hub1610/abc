const STORAGE_PREFIX = 'luckybuzz_';
const STORAGE_VERSION_KEY = `${STORAGE_PREFIX}schema_version`;
const CURRENT_STORAGE_VERSION = 1;

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public get<T>(collection: string, defaultValue: T): T {
    try {
      const key = `${STORAGE_PREFIX}${collection}`;
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading ${collection} from storage:`, error);
      return defaultValue;
    }
  }

  public set<T>(collection: string, value: T): void {
    try {
      const key = `${STORAGE_PREFIX}${collection}`;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${collection} to storage:`, error);
    }
  }

  public remove(collection: string): void {
    try {
      const key = `${STORAGE_PREFIX}${collection}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${collection} from storage:`, error);
    }
  }

  public clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  }

  public getVersion(): number {
    const v = localStorage.getItem(STORAGE_VERSION_KEY);
    return v ? parseInt(v, 10) : 0;
  }

  public setVersion(version: number): void {
    localStorage.setItem(STORAGE_VERSION_KEY, version.toString());
  }

  public isInitialized(): boolean {
    return this.getVersion() >= CURRENT_STORAGE_VERSION;
  }

  public exportDatabase(): string {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(data, null, 2);
  }

  public importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as Record<string, unknown>;
      this.clearAll();
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  }
}

export const storageService = StorageService.getInstance();
