import { Injectable } from "@angular/core";
import { HttpClientService } from "./http-client.service";
import { MoveRequest } from "../models/request/move.request";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MatchService {

  constructor(
    private httpClient: HttpClientService) {
  }
  
  createAImatch = async (mode: string) =>  await this.httpClient.postWithAuth("api/matches/ai", { mode });
  
  getMatch = async (matchId: string) => await this.httpClient.getWithAuth("api/matches/" + matchId, {});

  move = async (matchId: string, move: MoveRequest) => await this.httpClient.postWithAuth("api/matches/" + matchId + "/move", move);

  moveAI = async (matchId: string, move: MoveRequest) => await this.httpClient.postWithAuth("api/matches/" + matchId + "/moveAI", move);

  ready = async (matchId: string) => await this.httpClient.postWithAuth("api/matches/" + matchId + "/ready", {});
  
  forfeit = async (matchId: string) => await this.httpClient.putWithAuth("api/matches/" + matchId + "/resign", {});
}