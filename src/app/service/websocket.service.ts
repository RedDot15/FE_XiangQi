import { Injectable, OnDestroy } from '@angular/core';
import {CompatClient, Stomp} from '@stomp/stompjs';
import {StompSubscription} from '@stomp/stompjs/src/stomp-subscription';
import { ResponseObject } from '../models/response.object';
import { CookieService } from './cookie.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

export type ListenerCallBack = (message: ResponseObject) => void;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  
  private connection: CompatClient | null = null;

  private subscription: StompSubscription | undefined;

  constructor(
      private cookieService: CookieService) {
    this.connection = Stomp.over(() => new WebSocket(environment.baseWebSocket));
    this.connection.connect({}, () => {});
  }

  public listenToQueue(fun: ListenerCallBack) {
    const token = this.cookieService.getToken();

    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);
    
    if (this.connection) {
      return this.subscription = this.connection.subscribe('/topic/queue/player/' + uid, message => 
        fun(JSON.parse(message.body))); 
    }
    return null;
  }

  public listenToMatch(fun: ListenerCallBack) {
    const token = this.cookieService.getToken();

    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);
    
    if (this.connection) {
      return this.subscription = this.connection.subscribe('/topic/match/player/' + uid, message => 
        fun(JSON.parse(message.body))); 
    }
    return null;
  }

  // Function to decode JWT and extract uid using jwt-decode
  private getUidFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token); // Decode the token
      return decoded.uid || null; // Extract uid
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}
