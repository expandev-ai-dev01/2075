/**
 * @summary
 * In-memory store instance for ImageUpload sessions.
 * Provides singleton pattern for session management without database.
 *
 * @module instances/imageUpload/imageUploadStore
 */

import { IMAGE_UPLOAD_LIMITS } from '@/constants/imageUpload';

/**
 * ImageUpload session record structure
 */
export interface ImageUploadRecord {
  sessionId: string;
  status: 'nova' | 'em_andamento' | 'concluida' | 'erro';
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  fileBuffer: Buffer | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * In-memory store for ImageUpload sessions
 */
class ImageUploadStore {
  private sessions: Map<string, ImageUploadRecord> = new Map();

  /**
   * Get session by ID
   */
  getBySessionId(sessionId: string): ImageUploadRecord | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Create or update session
   */
  createOrUpdate(sessionId: string, data: ImageUploadRecord): ImageUploadRecord {
    if (this.sessions.size >= IMAGE_UPLOAD_LIMITS.MAX_SESSIONS && !this.sessions.has(sessionId)) {
      throw new Error('Maximum sessions limit reached');
    }
    this.sessions.set(sessionId, data);
    return data;
  }

  /**
   * Delete session by ID
   */
  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Check if session exists
   */
  exists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Get total count of sessions
   */
  count(): number {
    return this.sessions.size;
  }

  /**
   * Clear all sessions (useful for testing)
   */
  clear(): void {
    this.sessions.clear();
  }
}

/**
 * Singleton instance of ImageUploadStore
 */
export const imageUploadStore = new ImageUploadStore();
