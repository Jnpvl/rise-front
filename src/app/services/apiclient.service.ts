import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService  {

  private static instance: ApiclientService;

  private constructor(private httpClient: HttpClient) {}

  public static getInstance(httpClient: HttpClient): ApiclientService {
    if (!ApiclientService.instance) {
      ApiclientService.instance = new ApiclientService(httpClient);
    }
    return ApiclientService.instance;
  }

  public async get<T>(
    path: string,
    baseUrl: string = environment.apiUrl,
    options?: {
      headers?: HttpHeaders | { [key: string]: string };
      params?: { [key: string]: string | number | boolean };
    }
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    
    let httpParams = new HttpParams();
    if (options?.params) {
      Object.keys(options.params).forEach(key => {
        const value = options.params![key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
  
    const httpOptions = {
      headers: options?.headers instanceof HttpHeaders
        ? options.headers
        : new HttpHeaders(options?.headers),
      params: httpParams
    };
  
    const response = await this.httpClient.get<T>(url, httpOptions).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response;
  }
  

  public async getBlob(
    path: string,
    baseUrl: string = environment.apiUrl,
    headers?: { [key: string]: string }
  ): Promise<Blob> {
    const url = `${baseUrl}${path}`;
    const httpOptions = {
      headers: headers ? new HttpHeaders(headers) : undefined,
      responseType: 'blob' as const
    };
    const response = await this.httpClient.get(url, httpOptions).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response as Blob;
  }
  
  public async post<T>(
    path: string,
    body: any,
    baseUrl: string = environment.apiUrl,
    headers?: { [key: string]: string }
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    const response = await this.httpClient.post<T>(url, body, options).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response;
  }

  public async put<T>(
    path: string,
    body: any,
    baseUrl: string = environment.apiUrl,
    headers?: { [key: string]: string }
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    const response = await this.httpClient.put<T>(url, body, options).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response;
  }

  public async patch<T>(
    path: string,
    body: any,
    baseUrl: string = environment.apiUrl,
    headers?: { [key: string]: string }
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    const response = await this.httpClient.patch<T>(url, body, options).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response;
  }
  
  public async postBlob(
    path: string,
    body: any,
    baseUrl: string = environment.apiUrl,
    headers?: { [key: string]: string }
  ): Promise<Blob> {
    const url = `${baseUrl}${path}`;
    const options = {
      headers: headers ? new HttpHeaders(headers) : undefined,
      responseType: 'blob' as const
    };
    const response = await this.httpClient.post(url, body, options).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response as Blob;
  }

  public async delete<T>(
    path: string,
    baseUrl: string = environment.apiUrl,
    headers?: { [key: string]: string }
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const options = headers ? { headers: new HttpHeaders(headers) } : {};
    const response = await this.httpClient.delete<T>(url, options).toPromise();
    if (response === undefined) {
      throw new Error('Response is undefined');
    }
    return response;
  }
  
  
}
