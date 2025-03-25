import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
    let htppParams: HttpParams = new HttpParams();
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    Object.keys(params).forEach(key => {
      if (params[key]) {
        htppParams = htppParams.set(key, params[key]);
      }
    });

    try {
      const res = await lastValueFrom(this.http.get<any>(url, {
        params: htppParams,
        headers: headers
      }));
      return res;
    } catch (error: any) {
      console.log(error);
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(token, this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.getWithAuth(path, params);
        }
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async postWithAuth(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    try {
      return await lastValueFrom(this.http.post<any>(url, params, {
        headers: headers
      }));
    } catch (error: any) {
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(token, this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.postWithAuth(path, params);
        }
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async deleteWithAuth(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    let htppParams: HttpParams = new HttpParams();
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    Object.keys(params).forEach(key => {
      if (params[key]) {
        htppParams = htppParams.set(key, params[key]);
      }
    });

    try {
      return await lastValueFrom(this.http.delete<any>(url, {
        params: htppParams,
        headers: headers
      }));
    } catch (error: any) {
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(token, this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.deleteWithAuth(path, params);
        }
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async putWithAuth<T>(path: string, params: any): Promise<any> {
    const url = `${environment.baseUrl}/${path}`;
    const token = this.cookieService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    });

    try {
      return await lastValueFrom(this.http.put<any>(url, params, {
        headers: headers
      }));
    } catch (error: any) {
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(token, this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.putWithAuth(path, params);
        }
        this.router.navigate(["/login"]); 
      }
      return null;
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
      if(error.status == 401){
        const isRefreshedToken = await this.refreshToken(token, this.cookieService.getRefreshToken());  
        if(isRefreshedToken){
          return await this.postWithFile(path, data);
        }
        this.router.navigate(["/login"]); 
      }
      return null;
    }
  }

  async post<T>(path: string, params: any) {
    const url = `${environment.baseUrl}/${path}`;
    try {
      return await lastValueFrom(this.http.post<any>(url, params))
    } catch (error) {
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

    try {
      return await lastValueFrom(this.http.get<any>(url, {
        params: httpParams
      }));
    } catch (error) {
      return null;
    }
  }

  async refreshToken(token: string, refreshToken: string){
    const url = `${environment.baseUrl}/api/user/refreshToken`;
    let httpParams:HttpParams = new HttpParams();
    httpParams = httpParams.set('token', token);
    httpParams = httpParams.set('refreshToken', refreshToken);    
    const res = await lastValueFrom(this.http.get<any>(url, {
      params: httpParams
    }));
    if(res && res.statusCode == 200){
      this.cookieService.setToken(res.data.authToken); 
      this.cookieService.setRefreshToken(res.data.refreshToken);  
      return true;  
    }
    return false;
  } 
}
