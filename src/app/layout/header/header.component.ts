import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../service/player.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  username: string = 'Username'; // Biến lưu username, mặc định là 'Username'

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.loadPlayerInfo();
  }

  async loadPlayerInfo() {
    try {
      const response = await this.playerService.getMyInfo();
      this.username = response.data?.username || 'Username'; // Giả sử response trả về object với field username
    } catch (error) {
      console.error('Error fetching player info:', error);
    }
  }
}
