import { Component } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { Router } from '@angular/router';
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

  onPlayWithAI() {
    this.router.navigate(['/play/computer']);
  }
}
