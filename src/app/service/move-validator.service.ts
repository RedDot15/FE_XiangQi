import { Injectable } from '@angular/core';

interface Piece {
  type: 'xe' | 'ma' | 'tinh' | 'si' | 'tuong' | 'phao' | 'tot';
  color: 'red' | 'black';
}

@Injectable({
  providedIn: 'root'
})
export class MoveValidatorService {
  isValidMove(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: (Piece | null)[][]
  ): boolean {
    const fromPiece = board[fromRow][fromCol];
    const toPiece = board[toRow][toCol];

    if (!fromPiece) return false;

    // Can't take ally piece
    if (toPiece && toPiece.color === fromPiece.color) return false;

    // Piece-specific validation
    switch (fromPiece.type) {
      case 'tot':
        if (!this.isValidPawnMove(fromRow, fromCol, toRow, toCol, fromPiece)) return false;
        break;
      case 'tuong':
        if (!this.isValidMoveForKing(fromRow, fromCol, toRow, toCol, fromPiece)) return false;
        break;
      case 'phao':
        if (!this.isValidMoveForCannon(fromRow, fromCol, toRow, toCol, fromPiece, board)) return false;
        break;
      case 'xe':
        if (!this.isValidMoveForRook(fromRow, fromCol, toRow, toCol, fromPiece, board)) return false;
        break;
      case 'ma':
        if (!this.isValidMoveForHorse(fromRow, fromCol, toRow, toCol, fromPiece, board)) return false;
        break;
      case 'tinh':
        if (!this.isValidMoveForElephant(fromRow, fromCol, toRow, toCol, fromPiece, board)) return false;
        break;
      case 'si':
        if (!this.isValidMoveForAdvisor(fromRow, fromCol, toRow, toCol, fromPiece)) return false;
        break;
    }

    // Simulate the move
    const tempBoard = board.map(row => [...row]);
    tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
    tempBoard[fromRow][fromCol] = null;

    // Check kings facing and king in check
    if (this.areKingsFacing(tempBoard)) return false;
    if (this.isKingInCheck(tempBoard, fromPiece.color)) return false;

    return true;
  }

  private areKingsFacing(board: (Piece | null)[][]): boolean {
    let redKingRow = -1;
    let redKingCol = -1;
    let blackKingRow = -1;
    let blackKingCol = -1;

    // Find the positions of the two kings
    for (let row = 0; row < 10; row++) {
      for (let col = 3; col <= 5; col++) {
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
      return false;
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
        return false;
      }
    }

    return true;
  }

  private isKingInCheck(board: (Piece | null)[][], allyColor: 'red' | 'black'): boolean {
    // Find the allied king's position
    let kingRow = -1;
    let kingCol = -1;
    for (let row = 0; row < 10; row++) {
      for (let col = 3; col <= 5; col++) {
        const piece = board[row][col];
        if (piece?.type === 'tuong' && piece.color === allyColor) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    if (kingRow === -1) return false;

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

    return false;
  }

  private isValidPawnMove(fromRow: number, fromCol: number, toRow: number, toCol: number, pawn: Piece): boolean {
    const direction = pawn.color === 'red' ? -1 : 1;
    const hasCrossedRiver = (pawn.color === 'red' && fromRow < 5) || (pawn.color === 'black' && fromRow > 4);

    if (fromCol === toCol && toRow === fromRow + direction) {
      return true;
    }

    if (hasCrossedRiver && Math.abs(fromRow - toRow) === 0 && Math.abs(fromCol - toCol) === 1) {
      return true;
    }

    return false;
  }

  private isValidMoveForKing(fromRow: number, fromCol: number, toRow: number, toCol: number, king: Piece): boolean {
    if (fromRow === toRow && fromCol === toCol) return false;

    if (Math.abs(fromRow - toRow) > 1 || Math.abs(fromCol - toCol) > 1) {
      return false;
    }

    if (fromRow !== toRow && fromCol !== toCol) {
      return false;
    }

    if (king.color === 'red') {
      if (toRow < 7 || toRow > 9 || toCol < 3 || toCol > 5) {
        return false;
      }
    } else {
      if (toRow < 0 || toRow > 2 || toCol < 3 || toCol > 5) {
        return false;
      }
    }

    return true;
  }

  private isValidMoveForCannon(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    cannon: Piece,
    board: (Piece | null)[][]
  ): boolean {
    if (fromRow !== toRow && fromCol !== toCol) {
      return false;
    }

    let hasPieceInBetween = false;

    if (fromCol === toCol) {
      const step = toRow > fromRow ? 1 : -1;
      for (let row = fromRow + step; row !== toRow; row += step) {
        if (board[row][fromCol]) {
          if (hasPieceInBetween) {
            return false;
          }
          hasPieceInBetween = true;
        }
      }
    }

    if (fromRow === toRow) {
      const step = toCol > fromCol ? 1 : -1;
      for (let col = fromCol + step; col !== toCol; col += step) {
        if (board[fromRow][col]) {
          if (hasPieceInBetween) {
            return false;
          }
          hasPieceInBetween = true;
        }
      }
    }

    const targetPiece = board[toRow][toCol];

    if (hasPieceInBetween && targetPiece) {
      return true;
    }

    if (!hasPieceInBetween && !targetPiece) {
      return true;
    }

    return false;
  }

  private isValidMoveForRook(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    rook: Piece,
    board: (Piece | null)[][]
  ): boolean {
    if (fromRow === toRow) {
      return this.isPathClear(fromRow, fromCol, toCol, true, board);
    } else if (fromCol === toCol) {
      return this.isPathClear(fromCol, fromRow, toRow, false, board);
    }
    return false;
  }

  private isPathClear(fixed: number, start: number, end: number, isRowFixed: boolean, board: (Piece | null)[][]): boolean {
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    for (let i = min + 1; i < max; i++) {
      if (isRowFixed ? board[fixed][i] : board[i][fixed]) {
        return false;
      }
    }
    return true;
  }

  private isValidMoveForHorse(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    horse: Piece,
    board: (Piece | null)[][]
  ): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (rowDiff === 2 && colDiff === 1) {
      const midRow = (fromRow + toRow) / 2;
      return !board[midRow][fromCol];
    } else if (rowDiff === 1 && colDiff === 2) {
      const midCol = (fromCol + toCol) / 2;
      return !board[fromRow][midCol];
    }
    return false;
  }

  private isValidMoveForElephant(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    elephant: Piece,
    board: (Piece | null)[][]
  ): boolean {
    if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) {
      return false;
    }

    if (elephant.color === 'red' && toRow < 5) return false;
    if (elephant.color === 'black' && toRow > 4) return false;

    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    if (board[midRow][midCol]) return false;

    return true;
  }

  private isValidMoveForAdvisor(
    fromRow: number, 
    fromCol: number, 
    toRow: number, 
    toCol: number, 
    advisor: Piece): boolean {
    if (Math.abs(toRow - fromRow) !== 1 || Math.abs(toCol - fromCol) !== 1) {
      return false;
    }

    if (toCol < 3 || toCol > 5) return false;
    if (advisor.color === 'red' && (toRow < 7 || toRow > 9)) return false;
    if (advisor.color === 'black' && (toRow < 0 || toRow > 2)) return false;

    return true;
  }
}