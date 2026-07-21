import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type UploadedFile = {
  fileName: string;
  fileUrl: string;
  storedName?: string;
  patientId?: string;
  mimeType?: string;
  size?: number;
};

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private http: HttpClient) {}

  async uploadFile(file: File, patientId: string): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await firstValueFrom(
      this.http.post<{
        message: string;
        fileName: string;
        fileUrl: string;
        storedName?: string;
        patientId?: string;
        mimeType?: string;
        size?: number;
      }>(`${environment.apiUrl}uploads/patient/${patientId}`, formData)
    );

    return {
      fileName: response.fileName,
      fileUrl: response.fileUrl,
      storedName: response.storedName,
      patientId: response.patientId,
      mimeType: response.mimeType,
      size: response.size,
    };
  }

  async deleteFile(patientId: string, storedName: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${environment.apiUrl}uploads/patient/${encodeURIComponent(patientId)}/${encodeURIComponent(storedName)}`
      )
    );
  }

  /** Extract patientId + stored filename from a /uploads/{patientId}/{file} URL. */
  async deletePendingFiles(
    pending: Array<{ patientId: string; storedName: string }> | undefined
  ): Promise<void> {
    if (!pending?.length) return;
    await Promise.allSettled(
      pending.map((item) => this.deleteFile(item.patientId, item.storedName))
    );
  }

  parseUploadUrl(fileUrl: string): { patientId: string; storedName: string } | null {
    try {
      const pathname = new URL(fileUrl, window.location.origin).pathname;
      const match =
        pathname.match(/\/uploads\/([^/]+)\/([^/]+)$/) ||
        pathname.match(
          /\/storage\/v1\/object\/public\/[^/]+\/([^/]+)\/([^/]+)$/
        );
      if (!match) return null;
      return {
        patientId: decodeURIComponent(match[1]),
        storedName: decodeURIComponent(match[2]),
      };
    } catch {
      return null;
    }
  }
}
