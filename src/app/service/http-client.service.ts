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
  constructor(private http: HttpClient,
    private cookieService: CookieService,
    private router: Router) { }

  async getWithAuth(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    // Define headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Define params
    let httpParams: HttpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    // Get request
    try {
      const res = await lastValueFrom(this.http.get<any>(url, {
        params: httpParams,
        headers: headers
      }));
      return res;
    } catch (error: any) {
      console.log(error);
      // If unauthenticated: try refresh token
      if (error.status == 401){
        const isRefreshedToken = await this.refreshToken(this.cookieService.getRefreshToken());  
        if (isRefreshedToken){
          return await this.getWithAuth(path, params);
        }
        // Navigate back to login page if refresh fail
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async postWithAuth(path: string, body: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    // Define header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    // Post request
    try {
      return await lastValueFrom(this.http.post<any>(url, body, {
        headers: headers
      }));
    } catch (error: any) {
      // If unauthenticated: try refresh token
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.postWithAuth(path, body);
        }
        // Navigate back to login page if refresh fail
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async deleteWithAuth(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    // Define headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Define params
    let httpParams: HttpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    // Delete request
    try {
      return await lastValueFrom(this.http.delete<any>(url, {
        params: httpParams,
        headers: headers
      }));
    } catch (error: any) {
      // If unauthenticated: try refresh token
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.deleteWithAuth(path, params);
        }
        // Navigate back to login page if refresh fail
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async putWithAuth<T>(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    // Define headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    // Put request
    try {
      return await lastValueFrom(this.http.put<any>(url, params, {
        headers: headers
      }));
    } catch (error: any) {
      // If unauthenticated: try refresh token
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.putWithAuth(path, params);
        }
        // Navigate back to login page if refresh fail
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async postWithFile(path: string, data: FormData): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    // Define header
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Post file request
    try {
      return await lastValueFrom(this.http.post<any>(url, data, {
        headers: headers
      }));
    } catch (error: any) {
      // If unauthenticated: try refresh token
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.postWithFile(path, data);
        }
        // Navigate back to login page if refresh fail
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async post<T>(path: string, body: any) {
    const url = `${environment.baseUrl}/${path}`;

    // Define header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });

    // Post request
    try {
      return await lastValueFrom(this.http.post<any>(url, body, {
        headers: headers
      }));
    } catch (error : any) {
      return null;
    }
  }

  async get<T>(path: string, params: any) {
    const url = `${environment.baseUrl}/${path}`;
    let httpParams: HttpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    // Get request
    try {
      return await lastValueFrom(this.http.get<any>(url, {
        params: httpParams
      }));
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string){
    console.log('Refresh token...')

    // Define request
    const path = `/api/auth/token/refresh`;
    const body = { refreshToken: refreshToken };

    // Refresh request
    const res = await this.post(path, body);

    // Save new access token & new refresh token
    if(res.status == "ok"){
      this.cookieService.setToken(res.data.accessToken); 
      this.cookieService.setRefreshToken(res.data.refreshToken);  
      return true;  
    }

    return false;
  } 
}
