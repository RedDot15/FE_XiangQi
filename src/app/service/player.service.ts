import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';
import { AuthRequest } from '../models/request/auth.request';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    constructor(
        private httpClient: HttpClientService,
    ) {}

  getMyInfo = async () => await this.httpClient.getWithAuth('api/player/my-info/get', {});
  
//   register = async (auth: AuthRequest) => await this.httpClient.post('api/player/register', auth);
}
