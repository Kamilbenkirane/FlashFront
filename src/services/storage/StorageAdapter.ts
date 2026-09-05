import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface MMKVInstance {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

export class StorageAdapter {
  private mmkv: MMKVInstance | null = null;
  private id: string;

  constructor(id: string, encryptionKey: string) {
    this.id = id;
    if (Platform.OS !== 'web') {
      try {
        const { MMKV } = require('react-native-mmkv');
        this.mmkv = new MMKV({
          id: this.id,
          encryptionKey,
        });
      } catch (error) {
        console.warn(`MMKV not available for ${this.id}, falling back storage`);
      }
    }
  }

  async getString(key: string): Promise<string | null> {
    if (this.mmkv) {
      return this.mmkv.getString(key) || null;
    }
    try {
      return await AsyncStorage.getItem(`${this.id}_${key}`);
    } catch (error) {
      console.warn('AsyncStorage read error', error);
      return null;
    }
  }

  async setString(key: string, value: string): Promise<void> {
    if (this.mmkv) {
      this.mmkv.set(key, value);
      return;
    }
    try {
      await AsyncStorage.setItem(`${this.id}_${key}`, value);
    } catch (error) {
      console.warn('AsyncStorage write error', error);
    }
  }

  async removeString(key: string): Promise<void> {
    if (this.mmkv) {
      this.mmkv.delete(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(`${this.id}_${key}`);
    } catch (error) {
      console.warn('AsyncStorage remove error', error);
    }
  }
}
