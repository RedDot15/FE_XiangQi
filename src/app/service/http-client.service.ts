import { HttpClient, HttpHeaders, HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from './cookie.service';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) { }

  async getWithAuth(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let httpParams: HttpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    try {
      return await lastValueFrom(this.http.get<any>(url, {
        params: httpParams,
        headers: headers
      }));
    } catch (error: any) {
      if (error.status === 401) {
        if (this.isRefreshing) {
          const isRefreshed = await this.refreshPromise!;
          if (isRefreshed) {
            return await this.getWithAuth(path, params);
          }
          this.router.navigate(['/login']);
          return null;
        }
        const isRefreshed = await this.refreshToken(this.cookieService.getRefreshToken());
        if (isRefreshed) {
          return await this.getWithAuth(path, params);
        }
        this.router.navigate(['/login']);
        return null;
      }
      return null;
    }
  }

  async postWithAuth(path: string, body: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    try {
      return await lastValueFrom(this.http.post<any>(url, body, {
        headers: headers
      }));
    } catch (error: any) {
      if (error.status === 401) {
        if (this.isRefreshing) {
          const isRefreshed = await this.refreshPromise!;
          if (isRefreshed) {
            return await this.postWithAuth(path, body);
          }
          this.router.navigate(['/login']);
          return null;
        }
        const isRefreshed = await this.refreshToken(this.cookieService.getRefreshToken());
        if (isRefreshed) {
          return await this.postWithAuth(path, body);
        }
        this.router.navigate(['/login']);
        return null;
      }
      throw error;
    }
  }

  async patchWithAuth(path: string, body: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    try {
      return await lastValueFrom(this.http.patch<any>(url, body, {
        headers: headers
      }));
    } catch (error: any) {
      if (error.status === 401) {
        if (this.isRefreshing) {
          const isRefreshed = await this.refreshPromise!;
          if (isRefreshed) {
            return await this.patchWithAuth(path, body);
          }
          this.router.navigate(['/login']);
          return null;
        }
        const isRefreshed = await this.refreshToken(this.cookieService.getRefreshToken());
        if (isRefreshed) {
          return await this.patchWithAuth(path, body);
        }
        this.router.navigate(['/login']);
        return null;
      }
      throw error;
    }
  }

  async deleteWithAuth(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let httpParams: HttpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    try {
      return await lastValueFrom(this.http.delete<any>(url, {
        params: httpParams,
        headers: headers
      }));
    } catch (error: any) {
      if (error.status === 401) {
        if (this.isRefreshing) {
          const isRefreshed = await this.refreshPromise!;
          if (isRefreshed) {
            return await this.deleteWithAuth(path, params);
          }
          this.router.navigate(['/login']);
          return null;
        }
        const isRefreshed = await this.refreshToken(this.cookieService.getRefreshToken());
        if (isRefreshed) {
          return await this.deleteWithAuth(path, params);
        }
        this.router.navigate(['/login']);
        return null;
      }
      throw error;
    }
  }

  async putWithAuth(path: string, body: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    try {
      return await lastValueFrom(this.http.put<any>(url, body, {
        headers: headers
      }));
    } catch (error: any) {
      if (error.status === 401) {
        if (this.isRefreshing) {
          const isRefreshed = await this.refreshPromise!;
          if (isRefreshed) {
            return await this.putWithAuth(path, body);
          }
          this.router.navigate(['/login']);
          return null;
        }
        const isRefreshed = await this.refreshToken(this.cookieService.getRefreshToken());
        if (isRefreshed) {
          return await this.putWithAuth(path, body);
        }
        this.router.navigate(['/login']);
        return null;
      }
      throw error;
    }
  }

  async postWithFile(path: string, data: FormData): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    try {
      return await lastValueFrom(this.http.post<any>(url, data, {
        headers: headers
      }));
    } catch (error: any) {
      if (error.status === 401) {
        if (this.isRefreshing) {
          const isRefreshed = await this.refreshPromise!;
          if (isRefreshed) {
            return await this.postWithFile(path, data);
          }
          this.router.navigate(['/login']);
          return null;
        }
        const isRefreshed = await this.refreshToken(this.cookieService.getRefreshToken());
        if (isRefreshed) {
          return await this.postWithFile(path, data);
        }
        this.router.navigate(['/login']);
        return null;
      }
      throw error;
    }
  }

  async post(path: string, body: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });

    try {
      return await lastValueFrom(this.http.post<any>(url, body, {
        headers: headers
      }));
    } catch (error: any) {
      console.error('Error in post:', error);
      throw error;
    }
  }

  async get(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    let httpParams: HttpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    try {
      return await lastValueFrom(this.http.get<any>(url, {
        params: httpParams
      }));
    } catch (error: any) {
      console.error('Error in get:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }

    this.isRefreshing = true;
    console.log('Refresh token...');

    const path = `api/auth/tokens/refresh`;
    const body = { refreshToken: refreshToken };

    try {
      this.refreshPromise = this.post(path, body);
      const res = await this.refreshPromise;
      if (res && res.status === 'ok') {
        this.cookieService.setToken(res.data.accessToken);
        this.cookieService.setRefreshToken(res.data.refreshToken);
        this.isRefreshing = false;
        this.refreshPromise = null;
        return true;
      }
      this.isRefreshing = false;
      this.refreshPromise = null;
      return false;
    } catch (error) {
      console.error('Refresh token failed:', error);
      this.isRefreshing = false;
      this.refreshPromise = null;
      return false;
    }
  }
}
