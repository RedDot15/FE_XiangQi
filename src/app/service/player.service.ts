import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import { AuthRequest } from '../models/request/auth.request';
import { ChangePasswordRequest } from '../models/request/change-password.request';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    constructor(
        private httpClient: HttpClientService,
    ) {}

  getMyInfo = async () => await this.httpClient.getWithAuth('api/players/my-info/get', {});

  getAll = async (role: string) => await this.httpClient.getWithAuth('api/players/', {role: role});
  
  register = async (auth: AuthRequest) => await this.httpClient.post('api/players/register', auth);

  changePassword = async (request: ChangePasswordRequest) => await this.httpClient.putWithAuth('api/players/change-password', request)
}
