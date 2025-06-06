import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class QueueService {

  constructor(
    private httpClient: HttpClientService,
    private wsService: WebsocketService,
    private authService: AuthService,
  ) {}

  public joinQueue() {
    this.wsService.sendWebSocketMessage('/app/queue.join', {
      joinerId: this.authService.getUserId(),
    });
  }

  public unQueue() {
    this.wsService.sendWebSocketMessage('/app/queue.leave', {
      leaverId: this.authService.getUserId(),
    });
  }
}
