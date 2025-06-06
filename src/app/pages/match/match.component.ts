import { Component, OnInit, OnDestroy } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { GameSidebarComponent } from '../../components/game_sidebar/game-sidebar.component';
import { MatchService } from '../../service/match.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from '../../service/cookie.service';
import { jwtDecode } from 'jwt-decode';
import { WebsocketService } from '../../service/websocket.service';
import { MoveRequest } from '../../models/request/move.request';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatchResultModalComponent } from '../../components/match-result-modal/match-result-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import {InvitationService} from "../../service/invitation.service";
import {OnlinePlayerService} from "../../service/online-player.service";
import {AuthService} from "../../service/auth.service";

interface Piece {
  type: 'xe' | 'ma' | 'tinh' | 'si' | 'tuong' | 'phao' | 'tot';
  color: 'red' | 'black';
}

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [BoardComponent, GameSidebarComponent],
  templateUrl: './match.component.html',
  styleUrl: './match.component.css'
})
export class MatchComponent implements OnInit, OnDestroy {
  board: (Piece | null)[][] = [];
  currentPlayer: 'red' | 'black' = 'red';
  playerView: 'red' | 'black' = 'red';
  matchId: string = '-1';
  opponentName: string = "Opponent";
  playerName: string = "Me";
  opponentRating: number = 1200;
  playerRating: number = 1200;
  redPlayerTotalTimeLeft: number = 15*60; // 15 minutes in seconds
  blackPlayerTotalTimeLeft: number = 15*60;
  redPlayerTurnTimeLeft: number = 1*60; // 1 minutes in seconds
  blackPlayerTurnTimeLeft: number = 1*60;
  lastMoveTime: number | null = null;

  private timerInterval: any;
  private matchSubscription: any;

  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private invitationService: InvitationService,
    private onlinePlayerService: OnlinePlayerService,
    private wsService: WebsocketService,
    private dialog: MatDialog,
    private modal: NzModalService // Inject NzModalService
  ) {
    this.onlinePlayerService.setStatus('IN_MATCH');
  }

  ngOnInit() {
    this.invitationService.rejectInvite('');
    this.getMatchState();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.matchSubscription) {
      this.matchSubscription.unsubscribe();
    }
  }

  async getMatchState() {
    // Get UID
    const uid = this.authService.getUserId();

    // Get the match ID from the route parameters
    this.matchId = this.route.snapshot.paramMap.get('id')!;
    if (this.matchId) {
      // Get match state
      const matchState = await this.matchService.getMatch(this.matchId);
      // Get player's faction
      const isRedPlayer = matchState.data.redPlayer.id == uid;

      // Convert boardState
      this.board = this.convertBoardState(matchState.data.boardState);
      // Initial view
      this.playerView = isRedPlayer ? 'red' : 'black';
      // Get current turn
      this.currentPlayer = matchState.data.turn == uid ? this.playerView : this.playerView == 'red' ? 'black' : 'red';
      // Get players name
      this.opponentName = isRedPlayer ? matchState.data.blackPlayer.name : matchState.data.redPlayer.name;
      this.playerName = isRedPlayer ? matchState.data.redPlayer.name : matchState.data.blackPlayer.name;
      // Get players rating
      this.opponentRating = isRedPlayer ? matchState.data.blackPlayer.rating : matchState.data.redPlayer.rating;
      this.playerRating = isRedPlayer ? matchState.data.redPlayer.rating : matchState.data.blackPlayer.rating;
      // Get players time left
      this.redPlayerTotalTimeLeft = Math.round(matchState.data.redPlayer.totalTimeLeft / 1000) ;
      this.blackPlayerTotalTimeLeft = Math.round(matchState.data.blackPlayer.totalTimeLeft / 1000);
      // Get lastMoveTime
      this.lastMoveTime = matchState.data.lastMoveTime;

      // Setup & Start the timer
      this.setupTimer();
      this.startTimer();
      // Listening for opponent's move from server
      this.matchSubscription = await this.wsService.listenToMatch(this.matchId, messageObject => {
        if (messageObject.message == "Piece moved.") {
          const move = messageObject.data;
          // Move the piece
          this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
          this.board[move.from.row][move.from.col] = null;
          // Switch turn
          this.togglePlayer();
        } else if (messageObject.message == "Match finished.") {
          const res = messageObject.data;
          // Open match result notification modal
          this.dialog.open(MatchResultModalComponent, {
            disableClose: true,
            width: '400px', // Đặt kích thước modal
            data: {
              result: res.winner === this.playerView ? "WIN" : "LOSE", // "WIN" or "LOSE"
              ratingChange: res.winner === this.playerView ? res.ratingGain : res.ratingLoss // +10 or -10
            }
          });
        }
      });
    } else {
      console.error('Match ID not found in route parameters');
    }
  }

  private convertBoardState(boardState: string[][]): (Piece | null)[][] {
    const pieceMap: { [key: string]: Piece } = {
      'r': { type: 'xe', color: 'black' },
      'h': { type: 'ma', color: 'black' },
      'e': { type: 'tinh', color: 'black' },
      'a': { type: 'si', color: 'black' },
      'k': { type: 'tuong', color: 'black' },
      'c': { type: 'phao', color: 'black' },
      'p': { type: 'tot', color: 'black' },
      'R': { type: 'xe', color: 'red' },
      'H': { type: 'ma', color: 'red' },
      'E': { type: 'tinh', color: 'red' },
      'A': { type: 'si', color: 'red' },
      'K': { type: 'tuong', color: 'red' },
      'C': { type: 'phao', color: 'red' },
      'P': { type: 'tot', color: 'red' }
    };

    return boardState.map(row =>
      row.map(cell => (cell === '' ? null : pieceMap[cell]))
    );
  }

  private setupTimer() {
    // Get elapsed time
    const elapsed = Math.floor((Date.now() - new Date(this.lastMoveTime!).getTime()) / 1000);
    // Setup time left of current player
    if (this.currentPlayer === 'red') {
      this.redPlayerTotalTimeLeft = this.redPlayerTotalTimeLeft - elapsed;
      this.redPlayerTurnTimeLeft = this.redPlayerTurnTimeLeft - elapsed;
    }
    else
      this.blackPlayerTotalTimeLeft = this.blackPlayerTotalTimeLeft - elapsed;
    this.blackPlayerTurnTimeLeft = this.blackPlayerTurnTimeLeft - elapsed;
  }

  private startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.currentPlayer === 'red') {
        this.redPlayerTotalTimeLeft = Math.max(0, this.redPlayerTotalTimeLeft - 1);
        this.redPlayerTurnTimeLeft = Math.max(0, this.redPlayerTurnTimeLeft - 1);
      } else {
        this.blackPlayerTotalTimeLeft = Math.max(0, this.blackPlayerTotalTimeLeft - 1);
        this.blackPlayerTurnTimeLeft = Math.max(0, this.blackPlayerTurnTimeLeft - 1);
      }
      if (this.redPlayerTotalTimeLeft <= 0 || this.blackPlayerTotalTimeLeft <= 0) {
        alert(`${this.currentPlayer} hết thời gian!`);
      }
    }, 1000);
  }

  private togglePlayer() {
    // Reset turn-timer
    if (this.currentPlayer === 'red')
      this.redPlayerTurnTimeLeft = 1 * 60;
    else
      this.blackPlayerTurnTimeLeft = 1 * 60;
    // Switch turn
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
  }

  handleMove(move: MoveRequest) {
    // Send move request
    this.matchService.move(this.matchId, move);
  }

  onForfeitClick() {
    this.modal.create({
      nzClosable: false,
      nzMaskClosable: false, // Ngăn đóng modal khi bấm vào backdrop
      nzTitle: 'Xác nhận đầu hàng',
      nzContent: 'Bạn có chắc chắn muốn đầu hàng trận đấu này không?',
      nzFooter: [
        {
          label: 'Đầu hàng',
          type: 'primary',
          danger: true, // Đánh dấu nút đầu hàng là nguy hiểm
          onClick: () => {
            this.matchService.forfeit(this.matchId);
            this.modal.closeAll();
          }
        },
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => this.modal.closeAll()
        },
      ],
      nzStyle: { textAlign: 'center' }, // Căn giữa toàn bộ nội dung
      nzBodyStyle: { textAlign: 'center' }, // Căn giữa nội dung
    });
  }
}
