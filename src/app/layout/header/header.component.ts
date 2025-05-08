import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../service/player.service';
import { Router } from '@angular/router';
import { CookieService } from '../../service/cookie.service';
import { jwtDecode } from 'jwt-decode';
import { HistoryComponent } from '../../pages/history/history.component';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  username: string = 'Username'; // Biến lưu username, mặc định là 'Username'
  rating: number = 0;

  constructor(
    private playerService: PlayerService,
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadPlayerInfo();
  }

  async loadPlayerInfo() {
    try {
      const response = await this.playerService.getMyInfo();
      this.username = response.data?.username || 'Username'; // Giả sử response trả về object với field username
      this.rating = response.data?.rating
    } catch (error) {
      console.error('Error fetching player info:', error);
    }
  }
  
  onNavigateHistory(){
    // Get access token
    const token = this.cookieService.getToken();
    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);

    // Routing
    this.router.navigate(['/match-history/' + uid]);
  }

  async onLogout() {
    // Handle log out: delete cookie & send invalidate token
    await this.authService.handleLogout();
    // Routing to login page
    this.router.navigate(['/login']);
  }
  
  private getUidFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.uid || null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}
