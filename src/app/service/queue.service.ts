import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { ResponseObject } from '../models/response.object';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
    private apiServerUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  public joinQueue() : Observable<ResponseObject>{
    const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
    
    return this.http.post<ResponseObject>(
        `${this.apiServerUrl}/api/queue/join`, 
        {},
        { headers }
    );
  }
}