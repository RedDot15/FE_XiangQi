import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { MENU } from '../../models/navbar.constant';
import { NgClass, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { WebsocketService } from '../../service/websocket.service'; 

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
    private wsService: WebsocketService,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.wsService.initializeConnection();
    this.inviteeSubscription = await this.wsService.listenToInvite(responseObject => {
      this.ngZone.run(() => {
        if (responseObject.status === 'ok' && responseObject.message === 'A new invitation received.') {
          const username = responseObject.data;
          if (!this.invitations.includes(username)) {
            this.invitations.unshift(username); // Thêm lời mời mới vào đầu danh sách
          }
        } else if (responseObject.status === 'ok' && responseObject.message === 'Invitation canceled.') {
          const username = responseObject.data;
          this.invitations = this.invitations.filter(inv => inv !== username); // Xóa lời mời bị hủy
        } else if (responseObject.status === 'ok' && responseObject.message === 'CUSTOM_MATCH_CREATED') {
          this.router.navigate(['/match/' + responseObject.data.matchId]);
        }
      });
    });
  }

  onNavigate(path: any) {
    this.router.navigate([path]);
  }

  onAccept(username: string) {
    this.wsService.acceptInvite(username);
    this.invitations = this.invitations.filter(inv => inv !== username); // Xóa lời mời sau khi chấp nhận
  }

  onDecline(username: string) {
    this.wsService.rejectInvite(username);
  }

  ngOnDestroy() {
    if (this.inviteeSubscription) {
      this.inviteeSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }
}