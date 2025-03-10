import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-leader-board',
  standalone: true,
  imports: [
    NgFor
  ],
  templateUrl: './leader-board.component.html',
  styleUrl: './leader-board.component.css'
})
export class LeaderBoardComponent {
  topPlayers:any=[];
  
}
