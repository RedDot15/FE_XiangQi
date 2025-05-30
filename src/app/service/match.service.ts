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
  
  getMatch = async (matchId: string) => await this.httpClient.getWithAuth("api/matches/" + matchId, {});

  move = async (matchId: string, move: MoveRequest) => await this.httpClient.patchWithAuth("api/matches/" + matchId, move);
  
  forfeit = async (matchId: string) => await this.httpClient.patchWithAuth("api/matches/" + matchId + "/resign", {});
}