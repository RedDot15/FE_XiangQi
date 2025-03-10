import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

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

  ngOnInit() {
  }
  onCellClick(row: number, col: number) {
    const cell = this.board[row][col];
    console.log(cell)
    if (cell && cell.color !== this.currentPlayer) {
      if (this.selectedPiece) {
        this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
        this.selectedPiece = null;
      }
      return;
    }

    if (this.selectedPiece) {
      this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
      this.selectedPiece = null;
    }
    else if (cell) {
      this.selectedPiece = { row, col };
    }
  }


  movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    const fromPiece = this.board[fromRow][fromCol];
    const toPiece = this.board[toRow][toCol];

    if (fromPiece?.type === 'tot') {
      if (!this.isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece)) {
        return;
      }
    }
    if (fromPiece?.type === 'tuong') {
      if (!this.isValidMoveForKing(fromRow, fromCol, toRow, toCol, fromPiece)) {
        return;
      }
    }
    if (fromPiece?.type === 'phao') {
      if (!this.isValidMoveForCannon(fromRow, fromCol, toRow, toCol, fromPiece)) {
        return;
      }
    }
    if (toPiece && toPiece.color === fromPiece?.color) {
      return;
    }
    if (fromRow !== toRow || fromCol !== toCol) {
      console.log(`Di chuyển từ (${fromRow}, ${fromCol}) đến (${toRow}, ${toCol})`);
      this.togglePlayer();
    }

    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;


  }
  // Đổi lượt người chơi
  togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
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
  
  isValidMoveForCannon(fromRow: number, fromCol: number, toRow: number, toCol: number, cannon: Piece): boolean {
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
        if (this.board[row][fromCol]) {
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
        if (this.board[fromRow][col]) {
          if (hasPieceInBetween) {
            return false; // Nếu đã có quân cờ ở giữa mà không ăn được, không hợp lệ
          }
          hasPieceInBetween = true; // Gặp quân cờ ở giữa
        }
      }
    }
  
    // Kiểm tra quân đối phương nếu đang ăn
    const targetPiece = this.board[toRow][toCol];
    if (targetPiece && targetPiece.color === cannon.color) {
      return false; // Không hợp lệ nếu ăn quân cùng màu
    }
  
    // Nếu có quân cờ ở giữa, thì cần phải ăn quân địch
    if (hasPieceInBetween && targetPiece && targetPiece.color !== cannon.color) {
      return true; // Hợp lệ nếu có quân địch và quân cờ ở giữa
    }
  
    // Nếu không có quân cờ ở giữa, chỉ có thể đi qua các ô trống
    if (!hasPieceInBetween) {
      return true; // Hợp lệ nếu không có quân ở giữa và ô đích trống
    }
  
    return false; // Nếu không thỏa mãn các điều kiện trên, nước đi không hợp lệ
  }
  
} 
