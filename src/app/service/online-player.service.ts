import { Injectable, OnDestroy } from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";
import {HttpClientService} from "./http-client.service";

@Injectable({
  providedIn: 'root'
})
export class OnlinePlayerService {

  constructor(
      private wsService: WebsocketService,
      private authService: AuthService,
      private httpClient: HttpClientService,
      ) {}

  public setStatus(status: string) {
    this.wsService.sendWebSocketMessage('/app/status',
      `USER_ID:${this.authService.getUserId()}:STATUS:${status}`);
  }

  findPlayer = async (username: string) =>
    await this.httpClient.getWithAuth('api/online-players/' + username, {});

}
