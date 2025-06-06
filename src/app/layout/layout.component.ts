import {Component, OnInit} from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import {CookieService} from "../service/cookie.service";
import {AuthService} from "../service/auth.service";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, HeaderComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Get token
    const accessToken = this.cookieService.getToken();
    // Save user ID
    this.authService.saveUserInfo(accessToken);
  }

  onNavigateHome() {
    this.router.navigate(['/']);
  }
}
