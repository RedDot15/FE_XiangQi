import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../service/match.service';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from '../../service/cookie.service';
import { jwtDecode } from 'jwt-decode';
import { WebsocketService } from '../../service/websocket.service';
import { MoveRequest } from '../../models/request/move.request';
import { from } from 'rxjs';
import { Position } from '../../models/position.model';

interface Piece {
  type: 'xe' | 'ma' | 'tinh' | 'si' | 'tuong' | 'phao' | 'tot';
  color: 'red' | 'black';
}
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent implements OnInit {
  board: (Piece | null)[][] = [
    [{ type: 'xe', color: 'black' }, { type: 'ma', color: 'black' }, { type: 'tinh', color: 'black' }, { type: 'si', color: 'black' }, { type: 'tuong', color: 'black' }, { type: 'si', color: 'black' }, { type: 'tinh', color: 'black' }, { type: 'ma', color: 'black' }, { type: 'xe', color: 'black' }],
    [null, null, null, null, null, null, null, null, null],
    [null, { type: 'phao', color: 'black' }, null, null, null, null, null, { type: 'phao', color: 'black' }, null],
    [{ type: 'tot', color: 'black' }, null, { type: 'tot', color: 'black' }, null, { type: 'tot', color: 'black' }, null, { type: 'tot', color: 'black' }, null, { type: 'tot', color: 'black' }],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [{ type: 'tot', color: 'red' }, null, { type: 'tot', color: 'red' }, null, { type: 'tot', color: 'red' }, null, { type: 'tot', color: 'red' }, null, { type: 'tot', color: 'red' }],
    [null, { type: 'phao', color: 'red' }, null, null, null, null, null, { type: 'phao', color: 'red' }, null],
    [null, null, null, null, null, null, null, null, null],
    [{ type: 'xe', color: 'red' }, { type: 'ma', color: 'red' }, { type: 'tinh', color: 'red' }, { type: 'si', color: 'red' }, { type: 'tuong', color: 'red' }, { type: 'si', color: 'red' }, { type: 'tinh', color: 'red' }, { type: 'ma', color: 'red' }, { type: 'xe', color: 'red' }]
  ]; 

  selectedPiece: { row: number, col: number } | null = null;
  currentPlayer: 'red' | 'black' = 'red';
  playerView: 'red' | 'black' = 'red';
  matchId: string = '-1';

  private subscription: any;

  constructor(
      private matchService : MatchService,
      private route: ActivatedRoute,
      private cookieService: CookieService,
      private wsService: WebsocketService
      ) {}

  ngOnInit() {
    this.getMatchState();
  }

  async getMatchState(){
    const token = this.cookieService.getToken();

    // Decode the JWT to get the user ID
    const uid = this.getUidFromToken(token);

    var matchState;

    // Get the match ID from the route parameters
    this.matchId = this.route.snapshot.paramMap.get('id')!; // 'id' should match your route parameter name
    if (this.matchId) {
      // Conver string to number
       matchState = await this.matchService.getMatch(this.matchId); // Pass the match ID to getMatch()
       // Convert boardState 
       this.board = this.convertBoardState(matchState.data.boardState);
       // Initial view
       this.playerView = matchState.data.redPlayerId == uid ? 'red' : 'black';
       // Get current turn
       this.currentPlayer = matchState.data.turn == uid ? this.playerView : this.playerView == 'red' ? 'black' : 'red';

      // Lắng nghe phản hồi nước đi của đối thủ từ server
      this.subscription = this.wsService.listenToMatch(responseObject => {
        if (responseObject.status === 'ok') {
          const move = responseObject.data
          // Move the piece
          this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
          this.board[move.from.row][move.from.col] = null;
          // Switch turn
          this.togglePlayer();
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

    // Function to decode JWT and extract uid using jwt-decode
    private getUidFromToken(token: string): string | null {
      try {
        const decoded: any = jwtDecode(token); // Decode the token
        return decoded.uid || null; // Extract uid
      } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
      }
    }

  onCellClick(row: number, col: number) {
    if (this.playerView !== this.currentPlayer) return;

    const cell = this.board[row][col];

    // When haven't select any piece
    if (!this.selectedPiece){
      if (!cell || cell.color !== this.currentPlayer) return;
      this.selectedPiece = { row, col };
      return;
    }

    // When a piece is selected
    this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
    this.selectedPiece = null;
  }

  movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    const fromPiece = this.board[fromRow][fromCol];
    const toPiece = this.board[toRow][toCol];

    if (!fromPiece) return;

    if (fromPiece?.type === 'tot') {
      if (!this.isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece)) return;
    }
    if (fromPiece?.type === 'tuong') {
      if (!this.isValidMoveForKing(fromRow, fromCol, toRow, toCol, fromPiece)) return;
    }
    if (fromPiece?.type === 'phao') {
      if (!this.isValidMoveForCannon(fromRow, fromCol, toRow, toCol, fromPiece, this.board)) return;
    }
    if (fromPiece?.type === 'xe') {
      if (!this.isValidMoveForRook(fromRow, fromCol, toRow, toCol, fromPiece, this.board)) return;
    }
    if (fromPiece?.type === 'ma') {
      if (!this.isValidMoveForHorse(fromRow, fromCol, toRow, toCol, fromPiece, this.board)) return;
    }
    if (fromPiece?.type === 'tinh') {
      if (!this.isValidMoveForElephant(fromRow, fromCol, toRow, toCol, fromPiece, this.board)) return;
    }
    if (fromPiece?.type === 'si') {
      if (!this.isValidMoveForAdvisor(fromRow, fromCol, toRow, toCol, fromPiece)) return;
    }
    
    // Cant take ally piece
    if (toPiece && toPiece.color === fromPiece?.color) {
      return;
    }

    // Simulate the move on a temporary board
    const tempBoard = this.board.map(row => [...row]); // Deep copy of the board
    tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
    tempBoard[fromRow][fromCol] = null;

    // Check if kings face each other after the move
    if (this.areKingsFacing(tempBoard)) {
      return; // Move is invalid if kings face each other
    }

    // Check if the allied king is in check after the move
    if (this.isKingInCheck(tempBoard, fromPiece.color)) {
      return; // Move is invalid if it puts the allied king in check
    }

    // Move the selected piece
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;

    const from: Position = {
      row: fromRow,
      col: fromCol
    }
    const to: Position = {
      row: toRow,
      col: toCol
    }
    const moveRequest: MoveRequest = {
          from: from,
          to: to
        };

    this.matchService.move(this.matchId, moveRequest);

    console.log(`Di chuyển từ (${fromRow}, ${fromCol}) đến (${toRow}, ${toCol})`);
    this.togglePlayer();

  }

  // Đổi lượt người chơi
  togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    if (this.currentPlayer == this.playerView) this.checkForfeit();
  }

  isValidPawnMove(fromRow: number, fromCol: number, toRow: number, toCol: number, pawn: Piece): boolean {
    const direction = pawn.color === 'red' ? -1 : 1; // Red moves up (decreasing row), black moves down (increasing row)
    const hasCrossedRiver = (pawn.color === 'red' && fromRow < 5) || (pawn.color === 'black' && fromRow > 4);

    //Đi tiến 1 ô
    if (fromCol === toCol && toRow === fromRow + direction) {
      return true; // Valid forward move (one square)
    }
    
    //Nếu đã sang sông thì được đi ngang 1 ô
    if (hasCrossedRiver && Math.abs(fromRow - toRow) === 0 && Math.abs(fromCol - toCol) === 1) {
      return true; 
    }
  
    return false; 
  }

  isValidMoveForKing(fromRow: number, fromCol: number, toRow: number, toCol: number, king: Piece): boolean {

    if (fromRow == toRow && fromCol == toCol) return false;

    // Kiểm tra nếu quân đi quá 1 ô
    if (Math.abs(fromRow - toRow) > 1 || Math.abs(fromCol - toCol) > 1) {
      return false; // Không hợp lệ nếu di chuyển quá 1 ô
    }
  
    // Kiểm tra quân có đi đúng hướng không (lên, xuống, trái, phải)
    if (fromRow !== toRow && fromCol !== toCol) {
      return false; // Không hợp lệ nếu di chuyển chéo
    }
  
    // Kiểm tra quân có di chuyển trong cung không
    if (king.color === 'red') {
      if (toRow < 7 || toRow > 9 || toCol < 3 || toCol > 5) {
        return false; // Không hợp lệ nếu quân đi ra ngoài cung
      }
    } 
    else {
      if (toRow < 0 || toRow > 2 || toCol < 3 || toCol > 5) {
        return false; // Không hợp lệ nếu quân đi ra ngoài cung
      }
    }
  
    return true; // Nếu tất cả các điều kiện đều đúng, nước đi hợp lệ
  }
  
  isValidMoveForCannon(fromRow: number, fromCol: number, toRow: number, toCol: number, cannon: Piece, board: (Piece | null)[][]): boolean {
    // Kiểm tra nếu quân di chuyển ngang hoặc dọc
    if (fromRow !== toRow && fromCol !== toCol) {
      return false; // Không hợp lệ nếu không di chuyển ngang hay dọc
    }
  
    // Kiểm tra nếu có quân cờ ở giữa nếu đang di chuyển theo đường ngang hoặc dọc
    let hasPieceInBetween = false;
  
    // Di chuyển theo chiều dọc
    if (fromCol === toCol) {
      const step = toRow > fromRow ? 1 : -1;
      for (let row = fromRow + step; row !== toRow; row += step) {
        if (board[row][fromCol]) {
          if (hasPieceInBetween) {
            return false; // Nếu đã có quân cờ ở giữa mà không ăn được, không hợp lệ
          }
          hasPieceInBetween = true; // Gặp quân cờ ở giữa
        }
      }
    }
  
    // Di chuyển theo chiều ngang
    if (fromRow === toRow) {
      const step = toCol > fromCol ? 1 : -1;
      for (let col = fromCol + step; col !== toCol; col += step) {
        if (board[fromRow][col]) {
          if (hasPieceInBetween) {
            return false; // Nếu đã có quân cờ ở giữa mà không ăn được, không hợp lệ
          }
          hasPieceInBetween = true; // Gặp quân cờ ở giữa
        }
      }
    }
  
    // Kiểm tra quân đối phương nếu đang ăn
    const targetPiece = board[toRow][toCol];
  
    // Nếu có quân cờ ở giữa và có quân địch ở điểm đến
    if (hasPieceInBetween && targetPiece) {
      return true; 
    }
  
    // Nếu không có quân cờ ở giữa và không có địch ở điểm đến
    if (!hasPieceInBetween && !targetPiece) {
      return true;
    }
  
    return false; // Nếu không thỏa mãn các điều kiện trên, nước đi không hợp lệ
  }
  
  isValidMoveForRook(fromRow: number, fromCol: number, toRow: number, toCol: number, rook: Piece, board: (Piece | null)[][]): boolean {
    if (fromRow === toRow) {
      return this.isPathClear(fromRow, fromCol, toCol, true, board);
    } else if (fromCol === toCol) {
      return this.isPathClear(fromCol, fromRow, toRow, false, board);
    }
    return false;
  }

  // Helper for Rook and Cannon
  private isPathClear(fixed: number, start: number, end: number, isRowFixed: boolean, board: (Piece | null)[][]): boolean {
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    for (let i = min + 1; i < max; i++) {
      if (isRowFixed ? board[fixed][i] : board[i][fixed]) {
        return false; // Path blocked
      }
    }
    return true;
  }

  // Horse validation
  isValidMoveForHorse(fromRow: number, fromCol: number, toRow: number, toCol: number, horse: Piece, board: (Piece | null)[][]): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (rowDiff === 2 && colDiff === 1) {
      const midRow = (fromRow + toRow) / 2;
      return !board[midRow][fromCol]; // Check vertical leg
    } else if (rowDiff === 1 && colDiff === 2) {
      const midCol = (fromCol + toCol) / 2;
      return !board[fromRow][midCol]; // Check horizontal leg
    }
    return false;
  }

  // Elephant validation
  isValidMoveForElephant(fromRow: number, fromCol: number, toRow: number, toCol: number, elephant: Piece, board: (Piece | null)[][]): boolean {
    // Must move exactly 2 diagonally
    if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) {
      return false;
    }

    // Cannot cross the river
    if (elephant.color === 'red' && toRow < 5) return false;
    if (elephant.color === 'black' && toRow > 4) return false;

    // Check midpoint
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    if (board[midRow][midCol]) return false;

    return true;
  }

  // Advisor validation
  isValidMoveForAdvisor(fromRow: number, fromCol: number, toRow: number, toCol: number, advisor: Piece): boolean {
    // Must move exactly 1 diagonally
    if (Math.abs(toRow - fromRow) !== 1 || Math.abs(toCol - fromCol) !== 1) {
      return false;
    }

    // Must stay in palace (cols 3-5, rows 0-2 for black, 7-9 for red)
    if (toCol < 3 || toCol > 5) return false;
    if (advisor.color === 'red' && (toRow < 7 || toRow > 9)) return false;
    if (advisor.color === 'black' && (toRow < 0 || toRow > 2)) return false;

    return true;
  }

  // Check if kings are facing each other
  private areKingsFacing(board: (Piece | null)[][]): boolean {
    let redKingRow = -1;
    let redKingCol = -1;
    let blackKingRow = -1;
    let blackKingCol = -1;

    // Find the positions of the two kings
    for (let row = 0; row < 10; row++) {
      for (let col = 3; col <= 5; col++) { // Kings are in columns 3-5
        const piece = board[row][col];
        if (piece?.type === 'tuong' && piece.color === 'red') {
          redKingRow = row;
          redKingCol = col;
        } else if (piece?.type === 'tuong' && piece.color === 'black') {
          blackKingRow = row;
          blackKingCol = col;
        }
      }
    }

    // Ensure both kings were found
    if (redKingRow === -1 || blackKingRow === -1) {
      return false; // One or both kings missing (shouldn't happen in a valid game)
    }

    // Kings must be in the same column
    if (redKingCol !== blackKingCol) {
      return false;
    }

    // Check if there are any pieces between them
    const minRow = Math.min(redKingRow, blackKingRow);
    const maxRow = Math.max(redKingRow, blackKingRow);
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row][redKingCol] !== null) {
        return false; // Piece blocking the kings
      }
    }

    // No pieces blocking, kings are facing each other
    return true;
  }

  // Check if the allied king is in check
  private isKingInCheck(board: (Piece | null)[][], allyColor: 'red' | 'black'): boolean {
    // Find the allied king's position
    let kingRow = -1;
    let kingCol = -1;
    for (let row = 0; row < 10; row++) {
      for (let col = 3; col <= 5; col++) { // Kings are in columns 3-5
        const piece = board[row][col];
        if (piece?.type === 'tuong' && piece.color === allyColor) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    if (kingRow === -1) return false; // King not found (shouldn't happen)

    // Check if any enemy piece can move to the king's position
    const enemyColor = allyColor === 'red' ? 'black' : 'red';
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {   
        const piece = board[row][col];
        if (piece && piece.color === enemyColor) {
          switch (piece.type) {
            case 'tot':
              if (this.isValidPawnMove(row, col, kingRow, kingCol, piece)) return true;
              break;
            case 'tuong':
              if (this.isValidMoveForKing(row, col, kingRow, kingCol, piece)) return true;
              break;
            case 'phao':
              if (this.isValidMoveForCannon(row, col, kingRow, kingCol, piece, board)) return true;
              break;
            case 'xe':
              if (this.isValidMoveForRook(row, col, kingRow, kingCol, piece, board)) return true;
              break;
            case 'ma':
              if (this.isValidMoveForHorse(row, col, kingRow, kingCol, piece, board)) return true;
              break;
            case 'tinh':
              if (this.isValidMoveForElephant(row, col, kingRow, kingCol, piece, board)) return true;
              break;
            case 'si':
              if (this.isValidMoveForAdvisor(row, col, kingRow, kingCol, piece)) return true;
              break;
          }
        }
      }
    }

    return false; // No enemy piece can capture the king
  }

  // Check if the current player has any legal moves left and forfeit if not
  private checkForfeit() {
    if (!this.hasLegalMoves(this.currentPlayer)) {
      // this.forfeitGame();
      alert("Out of move!");
    }
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

  // Check if the player has any legal moves
  private hasLegalMoves(playerColor: 'red' | 'black'): boolean {
    for (let fromRow = 0; fromRow < 10; fromRow++) {
      for (let fromCol = 0; fromCol < 9; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && piece.color === playerColor) {
          // Try every possible destination
          for (let toRow = 0; toRow < 10; toRow++) {
            for (let toCol = 0; toCol < 9; toCol++) {
              // Simulate the move
              const tempBoard = this.board.map(row => [...row]);
              tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
              tempBoard[fromRow][fromCol] = null;

              // Check if the move is valid
              if (this.isValidMove(fromRow, fromCol, toRow, toCol, piece, tempBoard)) {
                return true; // Found at least one legal move
              }
            }
          }
        }
      }
    }
    return false; // No legal moves found
  }

  // Helper to check if a move is valid (factoring in all rules)
  private isValidMove(fromRow: number, fromCol: number, toRow: number, toCol: number, piece: Piece, tempBoard: (Piece | null)[][]): boolean {
    const toPiece = this.board[toRow][toCol]; // Use original board for toPiece check

    // Can't take ally piece
    if (toPiece && toPiece.color === piece.color) return false;

    // Piece-specific validation
    switch (piece.type) {
      case 'tot':
        if (!this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece)) return false;
        break;
      case 'tuong':
        if (!this.isValidMoveForKing(fromRow, fromCol, toRow, toCol, piece)) return false;
        break;
      case 'phao':
        if (!this.isValidMoveForCannon(fromRow, fromCol, toRow, toCol, piece, this.board)) return false;
        break;
      case 'xe':
        if (!this.isValidMoveForRook(fromRow, fromCol, toRow, toCol, piece, this.board)) return false;
        break;
      case 'ma':
        if (!this.isValidMoveForHorse(fromRow, fromCol, toRow, toCol, piece, this.board)) return false;
        break;
      case 'tinh':
        if (!this.isValidMoveForElephant(fromRow, fromCol, toRow, toCol, piece, this.board)) return false;
        break;
      case 'si':
        if (!this.isValidMoveForAdvisor(fromRow, fromCol, toRow, toCol, piece)) return false;
        break;
    }

    // Check kings facing and king in check
    if (this.areKingsFacing(tempBoard)) return false;
    if (this.isKingInCheck(tempBoard, piece.color)) return false;

    return true;
  }
} 
