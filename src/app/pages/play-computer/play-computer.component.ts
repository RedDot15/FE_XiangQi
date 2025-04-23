import { Component } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { MatchService } from '../../service/match.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-play-computer',
  standalone: true,
  imports: [],
  templateUrl: './play-computer.component.html',
  styleUrl: './play-computer.component.css'
})
export class PlayComputerComponent {
    constructor(private matchService: MatchService, private router: Router) {}
    
    async startGame() {
      try {
        const res: any = await this.matchService.createAImatch();
        const matchId = res.data;
        await this.router.navigate(['/match', matchId]);
      } catch (error) {
        console.error('Lỗi khi tạo trận đấu với AI:', error);
      }
    }
}
