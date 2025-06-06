import { Injectable, OnDestroy } from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";
import {HttpClientService} from "./http-client.service";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
      private wsService: WebsocketService,
      ) {}

  public sendChat(request: any) {
    this.wsService.sendWebSocketMessage('/app/chat', request);
  }
}
