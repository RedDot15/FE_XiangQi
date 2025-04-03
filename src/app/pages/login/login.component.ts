import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthModel } from '../../models/auth.model';
import { AuthService } from '../../service/auth.service';
import { CookieService } from '../../service/cookie.service';
import { Router } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    auth: AuthModel = {
      username: '',
      password: ''
    };
    confirmPassword = ''; // Dùng cho đăng ký
    isLogin = true;
  
    constructor(
      private authService: AuthService,
      private cookieService: CookieService,
      private router: Router,
    ) {}
  
    async login(event: Event) {
      event.preventDefault();

      // Get token
      const res = await this.authService.auth(this.auth);
      // Set token to cookie
      if (res.status == "ok") {
        const { accessToken, refreshToken} = res.data;
        this.cookieService.setToken(accessToken);
        this.cookieService.setRefreshToken(refreshToken);
        this.router.navigate(['/']);
      }
    }
  
    async register(event: Event) {
      event.preventDefault();
      if (this.auth.password !== this.confirmPassword) return;
  
      const res = await this.authService.register(this.auth);
      if (res.status == "ok") {
        this.isLogin = true; // Chuyển về trang đăng nhập sau khi đăng ký thành công
      }
    }
  }
  