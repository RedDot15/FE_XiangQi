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
  
  getPlayerMatches = async (page: number, size: number, userId: number) => await this.httpClient.getWithAuth("api/match/", {
    page: page,
    size: size,
    userId: userId
  })

  createAImatch = async (mode: string) =>  await this.httpClient.postWithAuth("api/match/ai", { mode });
  
  getMatch = async (matchId: string) => await this.httpClient.getWithAuth("api/match/" + matchId, {});

  move = async (matchId: string, move: MoveRequest) => await this.httpClient.postWithAuth("api/match/" + matchId + "/move", move);

  ready = async (matchId: string) => await this.httpClient.postWithAuth("api/match/" + matchId + "/ready", {});
  
  forfeit = async (matchId: string) => await this.httpClient.putWithAuth("api/match/" + matchId + "/resign", {});
}