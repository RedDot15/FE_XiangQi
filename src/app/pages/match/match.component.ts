import { Component, OnInit, OnDestroy } from '@angular/core';
import { BoardComponent } from '../../components/board/board.component';
import { GameSidebarComponent } from '../../components/game_sidebar/game-sidebar.component'; 
import { MatchService } from '../../service/match.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from '../../service/cookie.service';
import { jwtDecode } from 'jwt-decode';
import { WebsocketService } from '../../service/websocket.service';
import { MoveRequest } from '../../models/request/move.request';
import { MoveValidatorService } from '../../service/move-validator.service';
import { MatchWaitingModalComponent } from '../../components/match-waiting-modal/match-waiting-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatchResultModalComponent } from '../../components/match-result-modal/match-result-modal.component';
import { MatchCancelModalComponent } from '../../components/match-cancel-modal/match-cancel-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';

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
  private dialogRef: MatDialogRef<MatchWaitingModalComponent> | null = null;

  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private wsService: WebsocketService,
    private dialog: MatDialog,
    private modal: NzModalService // Inject NzModalService
  ) {
    this.wsService.setStatus('in_match');
  }

  ngOnInit() {
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
    // Get access token
    const token = this.cookieService.getToken();
    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);

    // Get the match ID from the route parameters
    this.matchId = this.route.snapshot.paramMap.get('id')!;
    if (this.matchId) {
      // Get match state
      const matchState = await this.matchService.getMatch(this.matchId);
      // Get player's faction
      const isRedPlayer = matchState.data.redPlayerId == uid;

      // Convert boardState 
      this.board = this.convertBoardState(matchState.data.boardState);
      // Initial view
      this.playerView = isRedPlayer ? 'red' : 'black';
      // Get current turn
      this.currentPlayer = matchState.data.turn == uid ? this.playerView : this.playerView == 'red' ? 'black' : 'red';
      // Get players name
      this.opponentName = isRedPlayer ? matchState.data.blackPlayerName : matchState.data.redPlayerName;
      this.playerName = isRedPlayer ? matchState.data.redPlayerName : matchState.data.blackPlayerName;
      // Get players rating
      this.opponentRating = isRedPlayer ? matchState.data.blackPlayerRating : matchState.data.redPlayerRating;
      this.playerRating = isRedPlayer ? matchState.data.redPlayerRating : matchState.data.blackPlayerRating;
      // Get players time left
      this.redPlayerTotalTimeLeft = Math.round(matchState.data.redPlayerTimeLeft / 1000) ;
      this.blackPlayerTotalTimeLeft = Math.round(matchState.data.blackPlayerTimeLeft / 1000);
      // Get lastMoveTime
      this.lastMoveTime = matchState.data.lastMoveTime;

      // If response contain lastMoveTime => the match is already start
      if (this.lastMoveTime != null) {
        // Setup & Start the timer
        this.setupTimer();
        this.startTimer();
        // Listening for opponent's move from server
        this.matchSubscription = await this.wsService.listenToMatch(responseObject => {
          if (responseObject.status === 'ok' && responseObject.message == "Piece moved.") {
            const move = responseObject.data;
            // Move the piece
            this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
            this.board[move.from.row][move.from.col] = null;
            // Switch turn
            this.togglePlayer();
          } else if (responseObject.status === 'ok' && responseObject.message == "Match finished.") {
            const res = responseObject.data;
            // Open match result notification modal
            this.dialog.open(MatchResultModalComponent, {
              disableClose: true,
              width: '400px', // Đặt kích thước modal
              data: {
                result: res.result, // "WIN" or "LOSE"
                ratingChange: res.ratingChange // +10 or -10
              }
            });  
          }
        });
      } else {
        // Open a modal to block moves and notify that match is not ready
        this.dialogRef = this.dialog.open(MatchWaitingModalComponent, {
          disableClose: true, // Prevent closing by clicking outside or pressing ESC
          width: '300px'
        });
        
        // Listen for match ready 
        this.matchSubscription = await this.wsService.listenToMatch(async responseObject => {
          if (responseObject.status === 'ok' && responseObject.message == 'The match is start.') {
            // Close the waiting opponent modal
            if (this.dialogRef) {
              this.dialogRef.close();
              this.dialogRef = null;
            }

            // Close the ready subscription
            this.matchSubscription.unsubscribe();
            // Get response data
            const data = responseObject.data;
            // Update last move time
            this.lastMoveTime = data.lastMoveTime;
            // Setup & Start timer
            this.setupTimer();
            this.startTimer();
            // Listening for opponent's move from server
            this.matchSubscription = await this.wsService.listenToMatch(responseObject => {
              if (responseObject.status === 'ok' && responseObject.message == "Piece moved.") {
                const move = responseObject.data;
                // Move the piece
                this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
                this.board[move.from.row][move.from.col] = null;
                // Switch turn
                this.togglePlayer();
              } else if (responseObject.status === 'ok' && responseObject.message == "Match finished.") {
                const res = responseObject.data;
                // Open match result notification modal
                this.dialog.open(MatchResultModalComponent, {
                  disableClose: true,
                  width: '400px', // Đặt kích thước modal
                  data: {
                    result: res.result, // "WIN" or "LOSE"
                    ratingChange: res.ratingChange // +10 or -10
                  }
                });  
              }
            });
          } else if (responseObject.status === 'ok' && responseObject.message == "Match cancel.") {
            const res = responseObject.data;
            // Close the waiting opponent modal
            if (this.dialogRef) {
              this.dialogRef.close();
              this.dialogRef = null;
            }
            // Open match cancel notification modal
            this.dialog.open(MatchCancelModalComponent, {
              disableClose: true,
              width: '400px'
            });
          }
        });
        // send match ready request
        this.matchService.ready(this.matchId);
      };
    } else {
      console.error('Match ID not found in route parameters');
    }
  }

  private getUidFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.uid || null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
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