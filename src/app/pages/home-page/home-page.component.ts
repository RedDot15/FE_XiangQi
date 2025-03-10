import { Component } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';

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

}
