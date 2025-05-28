import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';

@Injectable({
  providedIn: 'root',
})
export class MatchContractService {

  constructor(
    private httpClient: HttpClientService) {
  }

  accept = async (matchContractId: string) => await this.httpClient.patchWithAuth(`api/match-contracts/${matchContractId}/accept`, {});
}