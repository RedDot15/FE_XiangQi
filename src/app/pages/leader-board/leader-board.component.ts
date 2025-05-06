import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../service/websocket.service';
import { PlayerService } from '../../service/player.service';

@Component({
  selector: 'app-leader-board',
  standalone: true,
  imports: [
    NgFor,
    NgIf
  ],
  templateUrl: './leader-board.component.html',
  styleUrl: './leader-board.component.css'
})
export class LeaderBoardComponent implements OnInit {
  topPlayers: any = [];
  
  constructor (
    private wsService: WebsocketService,
    private playerService: PlayerService
  ) {
    this.wsService.setStatus('idle');
  }

  async ngOnInit() {
    const res =  await this.playerService.getAll('PLAYER');
    this.topPlayers = res.data;
  }
}
