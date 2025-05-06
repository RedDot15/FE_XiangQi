import { Injectable, OnDestroy } from '@angular/core';
import {CompatClient, Stomp} from '@stomp/stompjs';
import {StompSubscription} from '@stomp/stompjs/src/stomp-subscription';
import { CookieService } from './cookie.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { ResponseObject } from '../models/response/response.object';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { HttpClientService } from './http-client.service';

export type ListenerCallBack = (message: ResponseObject) => void;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  
  private connection: CompatClient | null = null;
  private inviteSubscription: StompSubscription | undefined;
  private userId: string | null = null;

  // Khóa chờ connection
  private connectionPromise: Promise<void>;
  private resolveConnection: (() => void) | null = null;

  constructor(
      private cookieService: CookieService,
      private router: Router,
      private httpClient: HttpClientService) {
    // Connection lock
    this.connectionPromise = new Promise((resolve) => {
      this.resolveConnection = resolve;
    });
    // Define connection
    this.connection = Stomp.over(() => new WebSocket(environment.baseWebSocket));
  }

  public initializeConnection() {
    // Connection lock
    this.connectionPromise = new Promise((resolve) => {
      this.resolveConnection = resolve;
    });
    // Get userId
    const token = this.cookieService.getToken();
    this.userId = this.getUidFromToken(token);
    // Connect
    if (this.connection && this.userId) {
      this.connection.connect({}, () => {
        console.log('WebSocket connected');
        // Resolve the connection promise
        this.resolveConnection?.();
      }, (error: any) => {
        console.error('WebSocket error:', error);
      });
    }
  }
  
  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
    }
  }

  public async setStatus(status: string) {
    if (!this.connection || !this.userId) return;

    // Wait for connection to be established
    await this.connectionPromise;

    if (status == 'in_match') {
      status = 'IN_MATCH';
    } else if (status == 'queue') {
      status = 'QUEUE';
    } else {
      status = 'IDLE';
    }

    if (this.connection) {
      this.connection.send('/app/status', {}, `USER_ID:${this.userId}:STATUS:${status}`);
    }
  }

  public listenToQueue(fun: ListenerCallBack) {
    const token = this.cookieService.getToken();

    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);
    
    if (this.connection) {
      return this.connection.subscribe('/topic/queue/player/' + uid, message => 
        fun(JSON.parse(message.body))); 
    }
    return null;
  }

  public async listenToInvite(fun: ListenerCallBack) {
    const token = this.cookieService.getToken();

    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);
    
    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      return this.connection.subscribe('/topic/invite/player/' + uid, message => 
        fun(JSON.parse(message.body))); 
    }
    return null;
  }

  public async listenToMatch(fun: ListenerCallBack) {
    const token = this.cookieService.getToken();

    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);
    
    // Wait for connection to be established
    await this.connectionPromise;
    
    if (this.connection) {
      return this.connection.subscribe('/topic/match/player/' + uid, message => 
        fun(JSON.parse(message.body))); 
    }
    return null;
  }

  public async listenToChat(matchId: string, fun: ListenerCallBack) {
    // Wait for connection to be established
    await this.connectionPromise;
    
    if (this.connection) {
      return this.connection.subscribe('/topic/chat/match/' + matchId, message => 
        fun(JSON.parse(message.body)));
    }
    return null;
  }

  public async sendChatMessage(matchId: string, message: string, sender: string) {
    const token = this.cookieService.getToken();
    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);

    if (!this.connection || !this.userId) {
      throw new Error('WebSocket connection not established or user not authenticated');
    }

    // Wait for connection to be established
    await this.connectionPromise;

    if (message.trim()) {
      // Send message to /app/chat with matchId in headers or payload
      this.connection.send('/app/chat', {}, JSON.stringify({
        matchId: matchId,
        sender: sender,
        message: message 
      }));
    }
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

  findPlayer = async (username: string) => await this.httpClient.getWithAuth('api/ws/player/' + username, {});

  invite = async (username: string) => await this.httpClient.postWithAuth('api/ws/player/' + username + '/invite', {});
  
  async unInvite(username: string): Promise<any> {
    const url = username ? `api/ws/player/${username}/un-invite` : 'api/ws/player/un-invite';
    return await this.httpClient.deleteWithAuth(url, {});
  }

  acceptInvite = async (username: string) => await this.httpClient.postWithAuth('api/ws/player/' + username + '/invitation-accept', {});
  
  rejectInvite = async (username: string) => await this.httpClient.deleteWithAuth('api/ws/player/' + username + '/invitation-reject', {});
  
}
