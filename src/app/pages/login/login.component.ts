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
      console.log(this.auth)
      event.preventDefault();
      const res = await this.authService.auth(this.auth);
      if (res && res.statusCode == 200) {
        const { authToken, refreshToken } = res.data;
        this.cookieService.setToken(authToken);
        this.cookieService.setRefreshToken(refreshToken);
        this.router.navigate(['/']);
      }
    }
  
    async register(event: Event) {
      event.preventDefault();
      if (this.auth.password !== this.confirmPassword) return;
  
      const res = await this.authService.register(this.auth);
      if (res && res.statusCode == 200) {
        this.isLogin = true; // Chuyển về trang đăng nhập sau khi đăng ký thành công
      }
    }
  }
  