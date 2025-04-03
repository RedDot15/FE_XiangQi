import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule, NzModalService,NzModalRef } from 'ng-zorro-antd/modal';
import { WebsocketService } from '../../service/websocket.service';
import { QueueService } from '../../service/queue.service';
import { ResponseObject } from '../../models/response.object';
import { HttpErrorResponse } from '@angular/common/http';
import { StompSubscription } from '@stomp/stompjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-play-pvp',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    NzModalModule,// Import để dùng modal
  ],
  templateUrl: './play-pvp.component.html',
  styleUrls: ['./play-pvp.component.css'] // Fix lỗi styleUrl -> styleUrls
})
export class PlayPvpComponent {
  searchName: string = '';
  searchRes: any[] = [];
  isSearched: boolean = false;
  modalRef!: NzModalRef; // Lưu trữ modal để có thể đóng

  private subscription: any;

  constructor(
    private modal: NzModalService, 
    private wsService: WebsocketService, 
    private queueService: QueueService,
    private router: Router) {}

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

  async playNow() {
    this.modalRef = this.modal.create({
      nzTitle: 'Đang tìm đối thủ...',
      nzContent: 'Hệ thống đang ghép cặp, vui lòng chờ.',
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => {
            // Unsubscribe when canceling
            if (this.subscription) {
              this.subscription.unsubscribe();
            }
            this.modalRef.close()
          }
        }
      ]
    });

    // Lắng nghe phản hồi từ server
    this.subscription = this.wsService.listenToQueue(responseObject => {
      if (responseObject.data.status === 'MATCH_FOUND') {
        this.modalRef.close();
        const successModal = this.modal.success({
          nzTitle: 'Ghép cặp thành công!',
          nzOnOk: () => {
            // Unsubscribe when success modal is closed
            if (this.subscription) {
              this.subscription.unsubscribe();
              this.router.navigate(['/match/' + responseObject.data.matchId]);
            }
          }
        });
      }
    });

    // Get token
    const res = await this.queueService.joinQueue();
  }
}
