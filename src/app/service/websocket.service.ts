import { Injectable, OnDestroy } from '@angular/core';
import {CompatClient, Stomp} from '@stomp/stompjs';
import {StompSubscription} from '@stomp/stompjs/src/stomp-subscription';
import { ResponseObject } from '../models/response.object';

export type ListenerCallBack = (message: ResponseObject) => void;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  
  private connection: CompatClient | null = null;

  private subscription: StompSubscription | undefined;

  constructor() {
    this.connection = Stomp.over(() => new WebSocket('ws://localhost:8080/ws'));
    this.connection.connect({}, () => {});
  }

  public listen(fun: ListenerCallBack): void {
    if (this.connection) {
      this.subscription = this.connection!.subscribe('/topic/queue/1', message => fun(JSON.parse(message.body))); 
    }
  }

}
