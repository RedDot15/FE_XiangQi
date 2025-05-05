import { Component, OnInit } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
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

  constructor (
    private wsService: WebsocketService
  ) {
    // Wait for WebSocket connection before setting status
    this.wsService.setStatus('idle');
  }

}
