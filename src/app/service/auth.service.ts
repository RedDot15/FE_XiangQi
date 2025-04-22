import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import { AuthRequest } from '../models/request/auth.request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClientService,
    private cookieService: CookieService,
    private router: Router) { }

  auth = async (auth: AuthRequest) => await this.httpClient.post('api/auth/token', auth);
  
  register = async (auth: AuthRequest) => await this.httpClient.post('api/player/register', auth);
  
  authenticated = async () => {
    const token = this.cookieService.getToken();
    if(!token) return false; 

    return true;
    const res = await this.httpClient.get('', {token: token});
    return res;
  }

  login = () => this.router.navigate(["login"]);

  logout = () => {
    this.cookieService.deleteToken();
    this.router.navigate(['login']);
  }
 
}
