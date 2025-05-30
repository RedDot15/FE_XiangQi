import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';

@Injectable({
  providedIn: 'root',
})
export class QueueService {

  constructor(
    private httpClient: HttpClientService) {
  }

  joinQueue = async () => await this.httpClient.postWithAuth('api/queue/join', {});

  unQueue = async () => await this.httpClient.deleteWithAuth('api/queue/cancel', {});
}