import { Injectable, OnDestroy } from '@angular/core';
import {CompatClient, Stomp} from '@stomp/stompjs';
import { environment } from '../../environments/environment';
import { ResponseObject } from '../models/response/response.object';
import {AuthService} from "./auth.service";

export type ListenerCallBack = (message: ResponseObject) => void;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private connection: CompatClient | null = null;

  // Khóa chờ connection
  private connectionPromise: Promise<void>;
  private resolveConnection: (() => void) | null = null;

  constructor(
      private authService: AuthService,
      ) {
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
    // Connect
    if (this.connection && this.authService.getUserId()) {
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

  public async listenToQueue(fun: ListenerCallBack) {
    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      return this.connection.subscribe('/topic/queue/player/' + this.authService.getUserId(), message =>
        fun(JSON.parse(message.body)));
    }
    return null;
  }

  public async listenToMatchContract(matchContractId: string, fun: ListenerCallBack) {
    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      return this.connection.subscribe('/topic/match-contract/' + matchContractId, message =>
        fun(JSON.parse(message.body)));
    }
    return null;
  }

  public async listenToInvite(fun: ListenerCallBack) {
    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      return this.connection.subscribe('/topic/invite/player/' + this.authService.getUserId(), message =>
        fun(JSON.parse(message.body)));
    }
    return null;
  }

  public async listenToMatch(matchId: string, fun: ListenerCallBack) {
    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      return this.connection.subscribe('/topic/match/' + matchId, message =>
        fun(JSON.parse(message.body)));
    }
    return null;
  }

  public async listenToChat(matchId: string, fun: ListenerCallBack) {
    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      return this.connection.subscribe('/topic/match/' + matchId + '/chat', message =>
        fun(JSON.parse(message.body)));
    }
    return null;
  }

  public async sendWebSocketMessage(destination: string, wsMessage: any) {
    if (!this.connection || !this.authService.getUserId()) return;

    // Wait for connection to be established
    await this.connectionPromise;

    if (this.connection) {
      this.connection.send(destination, {}, JSON.stringify(wsMessage));
    }
  }
}
