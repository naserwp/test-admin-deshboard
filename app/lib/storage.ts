import path from "path";
import { promises as fs } from "fs";

export type StoredFile = {
  storedName: string;
  path: string;
};

export interface StorageAdapter {
  saveFile(buffer: Buffer, filename: string): Promise<StoredFile>;
  getFilePath(storedName: string): string;
}

const uploadsDir = path.join(process.cwd(), "uploads");

export class LocalStorageAdapter implements StorageAdapter {
  async saveFile(buffer: Buffer, filename: string): Promise<StoredFile> {
    await fs.mkdir(uploadsDir, { recursive: true });
    const storedName = `${Date.now()}-${filename}`.replace(/\s+/g, "-");
    const filePath = path.join(uploadsDir, storedName);
    await fs.writeFile(filePath, buffer);
    return { storedName, path: filePath };
  }

  getFilePath(storedName: string): string {
    return path.join(uploadsDir, storedName);
  }
}

export const storage = new LocalStorageAdapter();
