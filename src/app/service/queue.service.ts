import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { ResponseObject } from '../models/response.object';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { HttpClientService } from './http-client.service';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
    private apiServerUrl = 'http://localhost:8080';

  constructor(
    private httpClient: HttpClientService,
    private http: HttpClient, 
    private cookieService: CookieService) {
  }

  joinQueue = async () => await this.httpClient.postWithAuth('api/queue/join', {});

}