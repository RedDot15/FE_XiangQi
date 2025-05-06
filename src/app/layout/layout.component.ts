import { Component, NgZone, OnInit } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { WebsocketService } from '../service/websocket.service';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterOutlet,
    HeaderComponent,
    NzModalModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit{
  private inviteeSubscription: any;
  private modalRef: NzModalRef | null = null;

  constructor (
    private router: Router,
    private wsService: WebsocketService,
    private ngZone: NgZone,
    private modalService: NzModalService,
  ) {}

  async ngOnInit(): Promise<void> {
    // Connect
    this.wsService.initializeConnection();
    // Listen to invite
    this.inviteeSubscription = await this.wsService.listenToInvite(responseObject => {
      this.ngZone.run(() => {
        if (responseObject.status === 'ok' && responseObject.message === "A new invitation received.") {
          // Open NZ modal with accept/decline buttons
          this.modalRef = this.modalService.create({
            nzTitle: 'New Match Invitation',
            nzContent: `You have received a new match invitation from ${responseObject.data}!`,
            nzFooter: [
              {
                label: 'Decline',
                type: 'default',
                onClick: () => this.onDecline(responseObject.data)
              },
              {
                label: 'Accept',
                type: 'primary',
                onClick: () => this.onAccept(responseObject.data)
              }
            ],
            nzClosable: false,
            nzMaskClosable: false
          });
        } else if (responseObject.status === 'ok' && responseObject.message === "Invitation canceled.") {
          // Close the invitation modal
          if (this.modalRef) {
            this.modalRef.close();
            this.modalRef = null;
          }
        } else if (responseObject.status === 'ok' && responseObject.message === 'CUSTOM_MATCH_CREATED') {
          // Close the invitation modal and navigate to match
          if (this.modalRef) {
            this.modalRef.close();
            this.modalRef = null;
          }
          this.router.navigate(['/match/' + responseObject.data.matchId]);
        }
      });
    });
  }

  // Handle accept button click
  onAccept(username: string) {
    this.wsService.acceptInvite(username);
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  // Handle decline button click
  onDecline(username: string) {
    this.wsService.rejectInvite(username);
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  onNavigateHome(){
    this.router.navigate(['/']);
  }

  // Clean up subscription and modal on component destruction
  ngOnDestroy() {
    if (this.inviteeSubscription) {
      this.inviteeSubscription.unsubscribe();
    }
    // Disconnect
    this.wsService.disconnect();
    // Close modal
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }
}
