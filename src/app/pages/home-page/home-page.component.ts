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
  onNavigate(path:any){
    this.router.navigate([path])
  }
  onPlayOnline() {
    this.router.navigate(['/play/PvP']);
  }
  onPlayWithAI(){
    this.router.navigate(['/play/computer']);
  }
  constructor (
    private wsService: WebsocketService,
    private router: Router
  ) {
    // Wait for WebSocket connection before setting status
    this.wsService.setStatus('idle');
  }

}
