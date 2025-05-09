import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
    private apiServerUrl = 'http://localhost:8080';

  constructor(
    private httpClient: HttpClientService) {
  }

  joinQueue = async () => await this.httpClient.postWithAuth('api/queue/join', {});

  acceptMatch = async (opponentId: number) => await this.httpClient.postWithAuth(`api/queue/opponent/${opponentId}/accept-match`, {});

  unQueue = async () => await this.httpClient.deleteWithAuth('api/queue/cancel', {});
}