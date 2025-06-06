import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayerService } from '../../service/player.service';
import { Router } from '@angular/router';
import { CookieService } from '../../service/cookie.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../service/auth.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, NgForm } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    NgbModule,
    NgIf,
    NzModalModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  username: string = 'Username'; // Biến lưu username, mặc định là 'Username'
  rating: number = 0;
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private playerService: PlayerService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private nzModalService: NzModalService,
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

  openChangePasswordModal(content: any) {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isLoading = false;
    this.modalService.open(content, {
    ariaLabelledBy: 'changePasswordModalLabel',
    backdropClass: 'custom-backdrop', // Thêm class tùy chỉnh cho backdrop
    windowClass: 'custom-modal',       // Thêm class tùy chỉnh cho modal
    backdrop: 'static', // Không cho phép đóng modal khi nhấn backdrop
  });
  }

  async changePassword(form: NgForm) {
    if (!form.valid) {
      this.nzModalService.error({
        nzTitle: 'Lỗi',
        nzContent: 'Vui lòng điền đầy đủ các trường bắt buộc.',
        nzOkText: 'Đóng'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.nzModalService.error({
        nzTitle: 'Lỗi',
        nzContent: 'Mật khẩu mới và xác nhận mật khẩu không khớp.',
        nzOkText: 'Đóng'
      });
      return;
    }

    // Kiểm tra mật khẩu mới có hợp lệ không (ví dụ: ít nhất 8 ký tự, có ký tự đặc biệt, v.v.)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.nzModalService.error({
        nzTitle: 'Lỗi',
        nzContent: 'Mật khẩu mới không hợp lệ. Mật khẩu phải có ít nhất 8 ký tự, chứa chữ cái, số và ký tự đặc biệt (@$!%*?&).',
        nzOkText: 'Đóng'
      });
      return;
    }

    this.isLoading = true; // Bật trạng thái loading
    try {
      const uid = this.authService.getUserId();
      if (uid) {
        const res = await this.playerService.changePassword({
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        });
        if (res) {
          this.modalService.dismissAll(); // Đóng modal
          this.nzModalService.success({
            nzTitle: 'Thành công',
            nzContent: 'Mật khẩu đã được đổi thành công!',
            nzOkText: 'Đóng'
          });
        }
      }
    } catch (error: any) {
      // Xử lý các trường hợp lỗi cụ thể từ server
      if (error.status === 400 && error.error?.message === 'Wrong password.') {
        this.nzModalService.error({
          nzTitle: 'Lỗi',
          nzContent: 'Mật khẩu cũ không đúng. Vui lòng thử lại.',
          nzOkText: 'Đóng'
        });
      } else if (error.status === 400 && error.error?.message === 'Validation failed.') {
        this.nzModalService.error({
          nzTitle: 'Lỗi',
          nzContent: 'Mật khẩu mới không hợp lệ. Vui lòng kiểm tra yêu cầu mật khẩu. Mật khẩu phải có ít nhất 8 ký tự, chứa chữ cái, số và ký tự đặc biệt (@$!%*?&).',
          nzOkText: 'Đóng'
        });
      } else {
        this.nzModalService.error({
          nzTitle: 'Lỗi',
          nzContent: 'Đã có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.',
          nzOkText: 'Đóng'
        });
      }
      console.error('Error changing password:', error);
    } finally {
      this.isLoading = false; // Tắt trạng thái loading
    }
  }

  onNavigateHistory(){
    const uid = this.authService.getUserId();

    // Routing
    this.router.navigate(['/match-history/' + uid]);
  }

  async onLogout() {
    // Handle log out: delete cookie & send invalidate token
    await this.authService.handleLogout();
    // Routing to login page
    this.router.navigate(['/login']);
  }
}
