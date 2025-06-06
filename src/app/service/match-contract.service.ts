import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class MatchContractService {

  constructor(
    private wsService: WebsocketService,
    private authService: AuthService,
  ) {}

  public accept(matchContractId: string) {
    this.wsService.sendWebSocketMessage('/app/match-contract.accept', {
      matchContractId: matchContractId,
      acceptorId: this.authService.getUserId(),
    });
  }
}
