import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CookieService } from '../../service/cookie.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthRequest } from '../../models/request/auth.request';
import { PlayerService } from '../../service/player.service';
import { OAuthConfig } from '../../../environments/environment';

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
  auth: AuthRequest = {
    username: '',
    password: ''
  };
  confirmPassword = '';
  isLogin = true;

  showModal = false;
  modalMessage = '';

  // --- Google OAuth Config ---
  private googleAuthUri = OAuthConfig.authUri;
  private googleClientId = OAuthConfig.clientId;
  private googleRedirectUri = OAuthConfig.redirectUri; 
  private googleScope = 'openid profile email'; 
  // -------------------------

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router,
    private playerService: PlayerService,
  ) {}

  async login(event: Event) {
    event.preventDefault();

    try {
      const res = await this.authService.auth(this.auth);
      if (res.status === "ok") {
        // Save token
        const { accessToken, refreshToken } = res.data;
        this.cookieService.setToken(accessToken);
        this.cookieService.setRefreshToken(refreshToken);
        // Navigate
        this.router.navigate(['/']);
      }

    }
    catch (error) {
      this.showModalMessage("Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập hoặc mật khẩu.");
      // this.showModalMessage("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.");
    }
  }

  async register(event: Event) {
    event.preventDefault();

    if (this.auth.password !== this.confirmPassword) {
      this.showModalMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!this.isStrongPassword(this.auth.password)) {
      this.showModalMessage("Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt.");
      return;
    }
    const req: AuthRequest = {
      ...this.auth,
      confirmPassword: this.confirmPassword
    };

    try {
      const res = await this.playerService.register(req);
      if (res.status === "ok") {
        console.log(req)
        this.showModalMessage("Đăng ký thành công!");
        setTimeout(() => {
          this.isLogin = true;
          this.showModal = false;
        }, 2000);
      }
    }
    catch (error:any) {
      console.log(error)
      if(error.status === 409 && error.error?.message === 'User already exists.'){
        this.showModalMessage("Tên người dùng đã tồn tại!")
      }
    }
  }

  signInWithGoogle() {
    const authUrl = `${this.googleAuthUri}?` +
                    `client_id=${this.googleClientId}&` +
                    `response_type=code&` +
                    `scope=${encodeURIComponent(this.googleScope)}&` +
                    `redirect_uri=${encodeURIComponent(this.googleRedirectUri)}&` +
                    `access_type=offline&` + // Request a refresh token
                    `prompt=consent select_account`; // Force consent and account selection

    window.location.href = authUrl;
  }

  showModalMessage(message: string) {
    this.modalMessage = message;
    this.showModal = true;

    setTimeout(() => {
      this.showModal = false;
    }, 2000);
  }

  isStrongPassword(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

}

