import { Injectable, OnDestroy } from '@angular/core';
import {CompatClient, Stomp} from '@stomp/stompjs';
import { CookieService } from './cookie.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { ResponseObject } from '../models/response/response.object';
import { Router } from '@angular/router';
import { HttpClientService } from './http-client.service';
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  constructor(
      private wsService: WebsocketService,
      private authService: AuthService,
      ) {}

  public createInvitation(inviteeUsername: string) {
    this.wsService.sendWebSocketMessage('/app/invitation.create', {
      inviterUsername: this.authService.getUsername(),
      inviteeUsername: inviteeUsername,
    });
  }

  public retrieveInvitation(inviteeUsername: string) {
    this.wsService.sendWebSocketMessage('/app/invitation.retrieve', {
      inviterUsername: this.authService.getUsername(),
      inviteeUsername: inviteeUsername
    });
  }

  public acceptInvite(inviterUsername: string) {
    this.wsService.sendWebSocketMessage('/app/invitation.accept', {
      inviterUsername: inviterUsername,
      inviteeUsername: this.authService.getUsername()
    });
  }

  public rejectInvite(inviterUsername: string) {
    this.wsService.sendWebSocketMessage('/app/invitation.reject', {
      inviterUsername: inviterUsername,
      inviteeUsername: this.authService.getUsername()
    });
  }
}
