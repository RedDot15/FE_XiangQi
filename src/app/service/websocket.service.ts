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
export class WebsocketService implements OnDestroy {
  
  private connection: CompatClient | null = null;
  private subscription: StompSubscription | undefined;
  private inviteSubscription: StompSubscription | undefined;
  private userId: string | null = null;
  private connectionPromise: Promise<void>;
  private resolveConnection: (() => void) | null = null;

  constructor(
      private cookieService: CookieService,
      private router: Router,
      private httpClient: HttpClientService) {
    this.connectionPromise = new Promise((resolve) => {
      this.resolveConnection = resolve;
    });
    this.connection = Stomp.over(() => new WebSocket(environment.baseWebSocket));
    this.initializeConnection();
  }

  private initializeConnection() {
    const token = this.cookieService.getToken();
    this.userId = this.getUidFromToken(token);

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
      return this.subscription = this.connection.subscribe('/topic/queue/player/' + uid, message => 
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
      return this.inviteSubscription = this.connection.subscribe('/topic/invite/player/' + uid, message => 
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

  findPlayer = async (username: string) => await this.httpClient.getWithAuth('api/ws/player/' + username, {});

  invite = async (username: string) => await this.httpClient.postWithAuth('api/ws/player/' + username + '/invite', {});
  
  async unInvite(username: string): Promise<any> {
    const url = username ? `api/ws/player/${username}/un-invite` : 'api/ws/player/un-invite';
    return await this.httpClient.deleteWithAuth(url, {});
  }

  acceptInvite = async (username: string) => await this.httpClient.postWithAuth('api/ws/player/' + username + '/invitation-accept', {});
  
  rejectInvite = async (username: string) => await this.httpClient.deleteWithAuth('api/ws/player/' + username + '/invitation-reject', {});
  

  logOut() {
    if (this.inviteSubscription) {
      this.inviteSubscription.unsubscribe();
    }
    if (this.connection) {
      this.connection.disconnect();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.connection) {
      this.connection.disconnect();
    }
  }

}
