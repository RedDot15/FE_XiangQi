import { Injectable } from "@angular/core";
import { HttpClientService } from "./http-client.service";
import { MoveRequest } from "../models/request/move.request";

@Injectable({
  providedIn: 'root',
})
export class MatchService {

  constructor(
    private httpClient: HttpClientService) {
  }

  getMatch = async (matchId: string) => await this.httpClient.getWithAuth("api/match/" + matchId, {});

  move = async (matchId: string, move: MoveRequest) => await this.httpClient.postWithAuth("api/match/" + matchId + "/move", move);

  ready = async (matchId: string) => await this.httpClient.postWithAuth("api/match/" + matchId + "/ready", {});
}