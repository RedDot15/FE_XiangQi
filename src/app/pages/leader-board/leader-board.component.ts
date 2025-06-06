import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../service/websocket.service';
import { PlayerService } from '../../service/player.service';
import { Router } from '@angular/router';
import {InvitationService} from "../../service/invitation.service";
import {OnlinePlayerService} from "../../service/online-player.service";

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
    private onlinePlayerService: OnlinePlayerService,
    private playerService: PlayerService,
    private router: Router,
  ) {
    this.onlinePlayerService.setStatus('IDLE');
  }

  async ngOnInit() {
    const res =  await this.playerService.getAll('PLAYER');
    if (res) {
      this.topPlayers = res.data;
    }
  }

  onNavigateHistory(id: string){
    this.router.navigate(['/match-history/' + id]);
  }
}
