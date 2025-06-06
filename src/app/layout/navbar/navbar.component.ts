import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { MENU } from '../../models/navbar.constant';
import { NgClass, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { WebsocketService } from '../../service/websocket.service';
import {InvitationService} from "../../service/invitation.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  menu = MENU;
  invitations: string[] = []; // Danh sách lời mời
  private inviteeSubscription: any;

  constructor(
    public router: Router,
    private invitationService: InvitationService,
    private wsService: WebsocketService,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.wsService.initializeConnection();
    this.inviteeSubscription = await this.wsService.listenToInvite(messageObject => {
      this.ngZone.run(() => {
        if (messageObject.message === 'To-invitee: A new invitation received.') {
          const username = messageObject.data;
          if (!this.invitations.includes(username)) {
            this.invitations.unshift(username); // Thêm lời mời mới vào đầu danh sách
          }
        } else if (
          messageObject.message === 'To-invitee: Invitation retrieved.' ||
          messageObject.message === 'To-invitee: Reject invitation success.') {
          const username = messageObject.data;
          this.invitations = this.invitations.filter(inv => inv !== username); // Xóa lời mời bị hủy
        } else if (messageObject.message === 'To-invitee: Accept invitation success.') {
          this.router.navigate(['/match/' + messageObject.data]);
        }
      });
    });
  }

  onNavigate(path: any) {
    this.router.navigate([path]);
  }

  onAccept(username: string) {
    this.invitationService.acceptInvite(username);
    this.invitations = this.invitations.filter(inv => inv !== username); // Xóa lời mời sau khi chấp nhận
  }

  onDecline(username: string) {
    this.invitationService.rejectInvite(username);
  }

  ngOnDestroy() {
    if (this.inviteeSubscription) {
      this.inviteeSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }
}
