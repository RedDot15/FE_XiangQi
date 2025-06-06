import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule, NzModalService,NzModalRef, ModalButtonOptions } from 'ng-zorro-antd/modal';
import { WebsocketService } from '../../service/websocket.service';
import { QueueService } from '../../service/queue.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatchContractService } from '../../service/match-contract.service';
import {InvitationService} from "../../service/invitation.service";
import {OnlinePlayerService} from "../../service/online-player.service";

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
  styleUrls: ['./play-pvp.component.css']
})
export class PlayPvpComponent implements OnInit, OnDestroy{
  searchName: string = '';
  searchRes: any[] = [];
  isSearched: boolean = false;
  modalRef!: NzModalRef; // Lưu trữ modal để có thể đóng
  hasAccepted: boolean = false;

  private queueSubscription: any;
  private inviterSubscription: any;
  private matchContractSubscription: any;

  constructor(
    private modal: NzModalService,
    private wsService: WebsocketService,
    private invitationService: InvitationService,
    private onlinePlayerService: OnlinePlayerService,
    private queueService: QueueService,
    private matchContractService: MatchContractService,
    private snackBar: MatSnackBar,
    private router: Router) {
      // Set websocket status
      this.onlinePlayerService.setStatus('IDLE');
    }

    async ngOnInit(): Promise<void> {
      // Add websocket listener to handle invitation response
      this.inviterSubscription = await this.wsService.listenToInvite(messageObject => {
        if (messageObject.message == "To-inviter: Your invitation sent.") {
          // Hàm xử lý đóng modal
          const handleModalClose = async () => {
            // Gửi request hủy mời
            this.invitationService.retrieveInvitation(messageObject.data);
          };
          // Mở modal chờ đối thủ phản hồi lời mời
          this.modalRef = this.modal.create({
            nzTitle: 'Đang chờ đối thủ...',
            nzContent: 'Hãy đợi cho đến khi đối thủ chấp nhận lời mời.',
            nzOnCancel: handleModalClose,
            nzFooter: [
              {
                label: 'Hủy',
                type: 'default',
                onClick: handleModalClose
              }
            ]
          });
        } else if (messageObject.message == "To-inviter: Retrieve invitation success.") { // Nếu đối thủ chấp nhận lời mời
          if (this.modalRef) {
            // Close modal
            this.modalRef.close();
          }
        } else if (messageObject.message == "To-inviter: Your invitation accepted.") { // Nếu đối thủ chấp nhận lời mời
          if (this.modalRef) {
            // Đóng modal mời
            this.modalRef.close();
            // Navigate
            this.router.navigate(['/match/' + messageObject.data]);
          }
        } else if (messageObject.message == "To-inviter: Your invitation rejected.") { // Nếu đối thủ từ chối lời mời
          if (this.modalRef) {
            // Đóng modal mời
            this.modalRef.close();
            // Thông báo lời mời bị từ chối
            this.snackBar.open('Lời mời đã bị từ chối!', 'Đóng', {
              duration: 3000, // Thời gian hiển thị (ms)
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
          }
        }
      });

      this.queueSubscription = await this.wsService.listenToQueue(async messageObject => {
        if (messageObject.message === 'Join queue success.') {
          // Đặt status đang queue
          this.onlinePlayerService.setStatus('QUEUE');

          // Hàm xử lý đóng modal
          const handleModalClose = async () => {
            this.queueService.unQueue();
          };

          // Mở modal tìm trận
          this.modalRef = this.modal.create({
            nzTitle: 'Đang tìm đối thủ...',
            nzContent: 'Hệ thống đang ghép cặp, vui lòng chờ.',
            nzOnCancel: handleModalClose,
            nzFooter: [
              {
                label: 'Hủy',
                type: 'default',
                onClick: handleModalClose,
              }
            ]
          });
        } else if (messageObject.message === 'Leave queue success.') {
          // Đóng modal tìm trận
          this.modalRef.close();
          // Đặt lại status về rảnh
          this.onlinePlayerService.setStatus('IDLE');
        } else if (messageObject.message === 'Match found.') {
          // Đóng modal tìm trận
          if (this.modalRef)
            this.modalRef.close();

          this.matchContractSubscription = await this.wsService.listenToMatchContract(messageObject.data, async messageObject => {
            if (messageObject.message === 'Match contract timeout.') {
              this.modalRef.close();
              this.matchContractSubscription.unsubscribe();

              if (this.hasAccepted) {
                this.snackBar.open('Trận đấu đã bị hủy do toàn bộ người chơi chưa sẵn sàng, đang tìm trận mới...', 'Đóng', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                });
                this.hasAccepted = false;
                this.playNow();
              } else {
                this.snackBar.open('Trận đấu đã bị hủy do toàn bộ người chơi chưa sẵn sàng...', 'Đóng', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                });
                this.onlinePlayerService.setStatus('IDLE');
              }
            } else if (messageObject.message === 'The match is created.') {
              this.modalRef.close();
              this.matchContractSubscription.unsubscribe();
              this.router.navigate(['/match/' + messageObject.data]);
            }
          })

          const createFooter = (loading: boolean): ModalButtonOptions[] => [
            {
              label: 'Đồng ý',
              type: 'primary',
              loading,
              onClick: async () => {
                this.hasAccepted = true;
                this.matchContractService.accept(messageObject.data);
                // Đợi phản hồi từ WebSocket, không đóng modal ở đây
                await new Promise(resolve => setTimeout(resolve, 6000));
              }
            }
          ];

          // Mở modal đồng ý trận đấu
          this.modalRef = this.modal.create({
            nzClosable: false,
            nzMaskClosable: false, // Ngăn đóng modal khi bấm vào backdrop
            nzTitle: 'Trận đấu đã được tìm thấy!',
            nzContent: 'Bạn có muốn tham gia trận đấu này không?',
            nzFooter: createFooter(false),
            nzStyle: { textAlign: 'center' }, // Căn giữa toàn bộ nội dung
            nzBodyStyle: { textAlign: 'center' }, // Căn giữa nội dung
          });
        }
      });

    }

  async searchPlayer() {
    // Hủy hàm nếu thanh tìm kiếm trống
    if (!this.searchName.trim()) return;
    // Tìm người chơi
    const res = await this.onlinePlayerService.findPlayer(this.searchName);
    if (res) { // Nếu tìm thấy
      // Hiển thị
      this.searchRes = [{ id: res.data.id, name: res.data.username, rating: res.data.rating}]
    } else { // Nếu không thấy
      this.searchRes = [];
    }
    // Đặt trạng thái
    this.isSearched = true;
  }

  async invitePlayer(playerName: string) {
    try {
      // Gửi một request mời tới đối thủ
      this.invitationService.createInvitation(playerName);
    } catch (error: any) {// Nếu gửi lời mời thất bại (hoặc do đối thủ đang tìm trận hoặc do đối thủ đang trong trận)
      // Thông báo mời thất bại do đối thủ đang tìm trận/trong trận
      this.snackBar.open(error.error.message, 'Đóng', {
        duration: 3000, // Thời gian hiển thị (ms)
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  async playNow() {
    // Get token
    this.queueService.joinQueue();
  }

  onNavigateHistory(id: string){
    this.router.navigate(['/match-history/' + id]);
  }

  ngOnDestroy() {
    // Unsubscribe
    if (this.inviterSubscription) {
      this.inviterSubscription.unsubscribe();
    }
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  async beforeUnloadHandler(event: Event) {
    // Gọi unQueue để xóa người chơi khỏi hàng đợi
    await this.queueService.unQueue();
    // Gọi unInvite để thu hồi mọi lời mời
    this.invitationService.retrieveInvitation('');
  }
}
