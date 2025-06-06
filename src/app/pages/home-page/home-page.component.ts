import { Component, OnInit } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { Router } from '@angular/router';
import { WebsocketService } from '../../service/websocket.service';
import {InvitationService} from "../../service/invitation.service";
import {OnlinePlayerService} from "../../service/online-player.service";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  constructor (
    private wsService: WebsocketService,
    private invitationService: InvitationService,
    private onlinePlayerService: OnlinePlayerService,
    private router: Router
  ) {
    // Wait for WebSocket connection before setting status
    this.onlinePlayerService.setStatus('IDLE');
  }

  onNavigate(path:any){
    this.router.navigate([path])
  }
  onPlayOnline() {
    this.router.navigate(['/play/PvP']);
  }
  onPlayWithAI(){
    this.router.navigate(['/play/computer']);
  }
}
