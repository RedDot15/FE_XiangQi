import { Injectable } from "@angular/core";
import { HttpClientService } from "./http-client.service";
import { MoveRequest } from "../models/request/move.request";
import { Observable } from "rxjs";
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class MatchService {

  constructor(
    private httpClient: HttpClientService,
    private wsService: WebsocketService,
    private authService: AuthService,
  ) {
  }

  getMatch = async (matchId: string) => await this.httpClient.getWithAuth("api/matches/" + matchId, {});

  public move(matchId: string, move: MoveRequest) {
    this.wsService.sendWebSocketMessage('/app/match.make-move', {
      matchId: matchId,
      moverId: this.authService.getUserId(),
      from: move.from,
      to: move.to,
    });
  }

  public forfeit(matchId: string) {
    this.wsService.sendWebSocketMessage('/app/match.resign', {
      matchId: matchId,
      surrenderId: this.authService.getUserId(),
    });
  }
}
