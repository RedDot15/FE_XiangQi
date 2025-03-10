import { Component } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [BoardComponent],
  templateUrl: './match.component.html',
  styleUrl: './match.component.css'
})
export class MatchComponent {

}
