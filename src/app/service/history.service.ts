import { Injectable } from "@angular/core";
import { HttpClientService } from "./http-client.service";
import { MoveRequest } from "../models/request/move.request";

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(
    private httpClient: HttpClientService) {
  }

  getAllByUserId =
    async (page: number, size: number, userId: number) => await this.httpClient.getWithAuth(
      "api/histories",
      {page: page, size: size, userId: userId})
}
