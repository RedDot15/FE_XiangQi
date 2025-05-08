import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import { AuthRequest } from '../models/request/auth.request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpClient: HttpClientService,
    private cookieService: CookieService,
  ) { }

  auth = async (auth: AuthRequest) => await this.httpClient.post('api/auth/token', auth);

  logout = async () => await this.httpClient.postWithAuth('api/auth/my-token/invalidate', {});
  
  authenticated = async () => {
    const token = this.cookieService.getToken();
    // Không có access token
    if (!token) 
      return false; 
    // Kiểm tra tính hợp lệ của access token
    const res = await this.httpClient.getWithAuth('api/auth/token/introspect', {});
    // Access token không hợp lệ
    if (!res)
      return false;
    // Return 
    return true;
  }

  handleLogout = async () => {
    // Invalidate token request
    const res = await this.logout();
    // Delete tokens
    if (res) {
      this.cookieService.deleteToken();
      this.cookieService.deleteRefreshToken();
    }
    return true;
  }
 }
