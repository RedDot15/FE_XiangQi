import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule, NzModalService,NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-play-pvp',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    NzModalModule // Import để dùng modal
  ],
  templateUrl: './play-pvp.component.html',
  styleUrls: ['./play-pvp.component.css'] // Fix lỗi styleUrl -> styleUrls
})
export class PlayPvpComponent {
  searchName: string = '';
  searchRes: any[] = [];
  isSearched: boolean = false;
  modalRef!: NzModalRef; // Lưu trữ modal để có thể đóng


  constructor(private modal: NzModalService) {}

  fakePlayers = [
    { id: 'p1', name: 'Nguyễn Văn A' },
    { id: 'p2', name: 'Trần Thị B' },
    { id: 'p3', name: 'Lê Văn C' },
    { id: 'p4', name: 'Phạm Minh D' }
  ];

  searchPlayer() {
    if (!this.searchName.trim()) return;

    // Lọc danh sách giả lập
    this.searchRes = this.fakePlayers.filter(player =>
      player.name.toLowerCase().includes(this.searchName.toLowerCase())
    );
    
    this.isSearched = true;
  }

  invitePlayer(playerId: string) {
    this.modalRef = this.modal.create({
      nzTitle: 'Đang chờ đối thủ...',
      nzContent: 'Hãy đợi cho đến khi đối thủ chấp nhận lời mời.',
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => this.modalRef.close()
        }
      ]
    });
  }

  playNow() {
    this.modalRef = this.modal.create({
      nzTitle: 'Đang tìm đối thủ...',
      nzContent: 'Hệ thống đang ghép cặp, vui lòng chờ.',
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => this.modalRef.close()
        }
      ]
    });
  }
}
