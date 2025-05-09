import { Component } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { MatchService } from '../../service/match.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../service/websocket.service';
@Component({
  selector: 'app-play-computer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './play-computer.component.html',
  styleUrl: './play-computer.component.css'
})
export class PlayComputerComponent {

  selectedDifficulty: string = 'AI_EASY';

  selectDifficulty(diff: string) {
    this.selectedDifficulty = diff;
  }

  constructor(
    private matchService: MatchService, 
    private router: Router,
    private wsService: WebsocketService
  ) {
    this.wsService.setStatus('idle');
  }
    
  async startGame() {
    try {
      const res: any = await this.matchService.createAImatch(this.selectedDifficulty);
      const matchId = res.data;
      await this.router.navigate(['/match-ai', matchId]);
    } catch (error) {
      console.error('Lỗi khi tạo trận đấu với AI:', error);
    }
  }
}
