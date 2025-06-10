import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service'; // Assuming AuthService handles API calls for social auth
import { CookieService } from '../../service/cookie.service';
import { PlayerService } from '../../service/player.service'; // Assuming PlayerService handles API calls for player registration
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { OAuthConfig } from '../../../environments/environment';

@Component({
  selector: 'app-social-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './social-register.component.html',
  styleUrl: './social-register.component.css'
})
export class SocialRegisterComponent implements OnInit {
  // Data to hold for registration form
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  registrationToken: string = ''; // Token received from backend for registration

  showRegistrationForm: boolean = false;
  socialEmail: string = ''; // To display to the user if they're registering

  showModal = false;
  modalMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const code = params['code'];
      const error = params['error']; // Check for OAuth errors

      if (error) {
        this.showModalMessage(`Lỗi đăng nhập Google: ${error}. Vui lòng thử lại.`);
        console.error('Google OAuth error:', error);
        setTimeout(() => this.router.navigate(['/login']), 3000);
        return;
      }

      if (code) {
        // Assume 'google' for now, but you can make this dynamic if use {provider} in the URL
        const provider = 'google'; 

        try {
          // Call your backend endpoint: POST /api/auth/outbound/google/authenticate
          const res = await this.authService.socialAuthenticate(provider, {
            authorizationCode: code,
            redirectUri: OAuthConfig.redirectUri}); 

          if (res.status === "ok") {
            if (res.data.userExists) {
              // User exists, save tokens and redirect to home
              const { accessToken, refreshToken } = res.data;
              this.cookieService.setToken(accessToken);
              this.cookieService.setRefreshToken(refreshToken);
              this.router.navigate(['/']);
            } else {
              // User does not exist, show registration form
              this.showRegistrationForm = true;
              this.registrationToken = res.data.registrationToken;
              this.socialEmail = res.data.email || 'N/A'; 
              this.showModalMessage("Tài khoản của bạn chưa được đăng ký. Vui lòng tạo tài khoản mới.");
            }
          }
        } catch (error: any) {
          console.error("Error during social authentication with backend:", error);
          this.showModalMessage("Có lỗi xảy ra khi xác thực Google. Vui lòng thử lại.");
          // Optionally redirect to login after error
          setTimeout(() => this.router.navigate(['/login']), 3000);
        }
      } else {
        // No code received, maybe direct access or incomplete OAuth flow
        this.showModalMessage("Truy cập không hợp lệ. Vui lòng đăng nhập qua Google.");
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }
    });
  }

  async registerSocialPlayer(event: Event) {
    event.preventDefault();

    if (this.password !== this.confirmPassword) {
      this.showModalMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!this.isStrongPassword(this.password)) {
      this.showModalMessage("Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt.");
      return;
    }

    try {
      // Call POST /api/players/social
      const registerRes = await this.playerService.registerSocial({
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword, 
        registrationToken: this.registrationToken
      }); 

      if (registerRes.status === "ok") {
        this.showModalMessage("Đăng ký thành công! Đang đăng nhập...");

        // After successful registration, call /api/auth/tokens to get JWT
        // Assuming your /api/auth/tokens endpoint accepts username/password for newly registered users
        const authRes = await this.authService.auth({ username: this.username, password: this.password });

        if (authRes.status === "ok") {
          const { accessToken, refreshToken } = authRes.data;
          this.cookieService.setToken(accessToken);
          this.cookieService.setRefreshToken(refreshToken);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        } else {
          // Fallback if token retrieval fails after registration
          this.showModalMessage("Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng đăng nhập lại.");
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      }
    } catch (error: any) {
      console.error("Error during social player registration:", error);
      if (error.status === 409 && error.error?.message === 'User already exists.') {
        this.showModalMessage("Tên người dùng đã tồn tại!");
      } else {
        this.showModalMessage("Đăng ký thất bại. Vui lòng thử lại.");
      }
    }
  }

  showModalMessage(message: string) {
    this.modalMessage = message;
    this.showModal = true;

    setTimeout(() => {
      this.showModal = false;
    }, 3000); // Increased duration for modals in this component
  }

  isStrongPassword(password: string): boolean {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
}