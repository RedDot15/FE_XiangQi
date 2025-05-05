import { Component, OnInit } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { Router } from '@angular/router';
import { WebsocketService } from '../../service/websocket.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    BoardComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  constructor(public router:Router){
  }
  onNavigate(path:any){
    this.router.navigate([path])
  }
  onPlayOnline() {
    this.router.navigate(['/play/PvP']);
  }

  constructor (
    private wsService: WebsocketService
  ) {
    // Wait for WebSocket connection before setting status
    this.wsService.setStatus('idle');
  }

}
