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

interface Piece {
  type: 'xe' | 'ma' | 'tinh' | 'si' | 'tuong' | 'phao' | 'tot';
  color: 'red' | 'black';
}

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [BoardComponent, GameSidebarComponent, MatchWaitingModalComponent],
  templateUrl: './match.component.html',
  styleUrl: './match.component.css'
})
export class MatchComponent implements OnInit, OnDestroy {
  board: (Piece | null)[][] = [];
  currentPlayer: 'red' | 'black' = 'red';
  playerView: 'red' | 'black' = 'red';
  matchId: string = '-1';
  redPlayerTotalTimeLeft: number = 900; // 15 minutes in seconds
  blackPlayerTotalTimeLeft: number = 900;
  lastMoveTime: number | null = null;

  private timerInterval: any;
  private subscription: any;
  private dialogRef: MatDialogRef<MatchWaitingModalComponent> | null = null;

  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private wsService: WebsocketService,
    private moveValidator: MoveValidatorService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getMatchState();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.subscription) {
      this.subscription.close();
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
      // Convert boardState 
      this.board = this.convertBoardState(matchState.data.boardState);
      // Initial view
      this.playerView = matchState.data.redPlayerId == uid ? 'red' : 'black';
      // Get current turn
      this.currentPlayer = matchState.data.turn == uid ? this.playerView : this.playerView == 'red' ? 'black' : 'red';
      // Get players time left
      this.redPlayerTotalTimeLeft = matchState.data.redPlayerTimeLeft / 1000;
      this.blackPlayerTotalTimeLeft = matchState.data.blackPlayerTimeLeft / 1000;
      // Get lastMoveTime
      this.lastMoveTime = matchState.data.lastMoveTime;

      // If response contain lastMoveTime => the match is already start
      if (this.lastMoveTime != null) {
        // Setup & Start the timer
        this.setupTimer();
        this.startTimer();
        // Listening for opponent's move from server
        this.subscription = this.wsService.listenToMatch(responseObject => {
          if (responseObject.status === 'ok' && responseObject.message == "Opponent player has moved.") {
            const move = responseObject.data;
            // Move the piece
            this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
            this.board[move.from.row][move.from.col] = null;
            // Switch turn
            this.togglePlayer();
          }
        });
      } else {
        // Open a modal to block moves and notify that match is not ready
        this.dialogRef = this.dialog.open(MatchWaitingModalComponent, {
          disableClose: true, // Prevent closing by clicking outside or pressing ESC
          width: '300px'
        });
        
        // Listen for match ready 
        this.subscription = this.wsService.listenToMatch(responseObject => {
          if (responseObject.status === 'ok' && responseObject.message == 'The match is start.') {
            // Close the modal that blocks the player
            if (this.dialogRef) {
              this.dialogRef.close();
              this.dialogRef = null;
            }

            // Close the ready subscription
            this.subscription.unsubscribe();
            // Get response data
            const data = responseObject.data;
            // Update last move time
            this.lastMoveTime = data.lastMoveTime;
            // Setup & Start timer
            this.setupTimer();
            this.startTimer();
            // Listening for opponent's move from server
            this.subscription = this.wsService.listenToMatch(responseObject => {
              if (responseObject.status === 'ok' && responseObject.message == "Opponent player has moved.") {
                const move = responseObject.data;
                // Move the piece
                this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
                this.board[move.from.row][move.from.col] = null;
                // Switch turn
                this.togglePlayer();
              }
            });
          };
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

  setupTimer() {
    // Get elapsed time 
    const elapsed = Math.floor((Date.now() - new Date(this.lastMoveTime!).getTime()) / 1000);
    console.log(Date.now());
    console.log('lastMoveTime: ' + this.lastMoveTime);
    console.log('elapsed: ' + elapsed);
    // Setup time left of current player
    if (this.currentPlayer === 'red')
      this.redPlayerTotalTimeLeft = this.redPlayerTotalTimeLeft - elapsed;
    else 
      this.blackPlayerTotalTimeLeft = this.blackPlayerTotalTimeLeft - elapsed;
    // Start the timer
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.currentPlayer === 'red') {
        this.redPlayerTotalTimeLeft = Math.max(0, this.redPlayerTotalTimeLeft - 1);
      } else {
        this.blackPlayerTotalTimeLeft = Math.max(0, this.blackPlayerTotalTimeLeft - 1);
      }
      if (this.redPlayerTotalTimeLeft <= 0 || this.blackPlayerTotalTimeLeft <= 0) {
        clearInterval(this.timerInterval);
        alert(`${this.currentPlayer} hết thời gian!`);
      }
    }, 1000);
  }

  togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    if (this.currentPlayer == this.playerView) this.checkForfeit();
  }

  // Check if the current player has any legal moves left and forfeit if not
  private checkForfeit() {
    if (!this.hasLegalMoves(this.currentPlayer)) {
      // this.forfeitGame();
      alert("Out of move!");
    }
  }

  // Check if the player has any legal moves
  private hasLegalMoves(playerColor: 'red' | 'black'): boolean {
    for (let fromRow = 0; fromRow < 10; fromRow++) {
      for (let fromCol = 0; fromCol < 9; fromCol++) {
        const piece = this.board[fromRow][fromCol]
        if (piece && piece.color === playerColor) {
          // Try every possible destination
          for (let toRow = 0; toRow < 10; toRow++) {
            for (let toCol = 0; toCol < 9; toCol++) {
              // Check if the move is valid
              if (this.moveValidator.isValidMove(fromRow, fromCol, toRow, toCol, this.board)) {
                return true; // Found at least one legal move
              }
            }
          }
        }
      }
    }
    return false; // No legal moves found
  }

  // Send API request to forfeit the game
  // private forfeitGame() {
  //   const forfeitData = {
  //     player: this.currentPlayer,
  //     reason: 'No legal moves available',
  //   };

  //   this.http.post('/api/forfeit', forfeitData).subscribe({
  //     next: (response) => {
  //       console.log('Forfeit successful:', response);
  //       // Optionally reset the game or show a message
  //       alert(`${this.currentPlayer} has forfeited the game due to no legal moves.`);
  //     },
  //     error: (error) => {
  //       console.error('Forfeit failed:', error);
  //     },
  //   });
  // }

  handleMove(move: MoveRequest) {
    // Move the selected piece
    this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
    this.board[move.from.row][move.from.col] = null;
    // Send move request
    this.matchService.move(this.matchId, move);
    // Change turn
    this.togglePlayer();
  }
}