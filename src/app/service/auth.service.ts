import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import { AuthRequest } from '../models/request/auth.request';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userId: string | null = null;
  username: string | null = null;

  constructor(
    private httpClient: HttpClientService,
    private cookieService: CookieService,
  ) { }

  saveUserInfo(accessToken: string) {
    // Save userId
    this.userId = this.getUidFromToken(accessToken);
    // Save username
    this.username = this.getUsernameFromToken(accessToken);
  }

  auth = async (auth: AuthRequest) => await this.httpClient.post('api/auth/tokens', auth);

  socialAuthenticate = async (provider: string, request: any) => await this.httpClient.post(`api/auth/outbound/${provider}/authenticate`, request);

  logout = async () => await this.httpClient.deleteWithAuth('api/auth/tokens', {});

  authenticated = async () => {
    const token = this.cookieService.getToken();
    // Không có access token
    if (!token)
      return false;
    // Kiểm tra tính hợp lệ của access token
    const res = await this.httpClient.getWithAuth('api/auth/tokens/introspect', {});
    // Access token không hợp lệ
    if (!res)
      return false;
    // Return
    return true;
  }

  getUserId =  () => {
    // Get userId
    return this.userId;
  }

  getUsername =  () => {
    // Get userId
    return this.username;
  }

  handleLogout = async () => {
    // Invalidate token request
    const res = await this.logout();
    // Delete tokens
    if (res) {
      this.cookieService.deleteToken();
      this.cookieService.deleteRefreshToken();
      this.userId = null;
    }
    return true;
  }

  // Function to decode JWT and extract uid using jwt-decode
  private getUidFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token); // Decode the token
      return decoded.uid || null; // Extract uid
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Function to decode JWT and extract uid using jwt-decode
  private getUsernameFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token); // Decode the token
      return decoded.sub || null; // Extract uid
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
 }
