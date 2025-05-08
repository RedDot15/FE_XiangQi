import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MoveRequest } from '../../models/request/move.request';
import { Position } from '../../models/position.model';
import { MoveValidatorService } from '../../service/move-validator.service';

interface Piece {
  type: 'xe' | 'ma' | 'tinh' | 'si' | 'tuong' | 'phao' | 'tot';
  color: 'red' | 'black';
}
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent {
  @Input() board: (Piece | null)[][] = [];
  @Input() currentPlayer: 'red' | 'black' = 'red';
  @Input() playerView: 'red' | 'black' = 'red';
  @Output() move = new EventEmitter<MoveRequest>();

  selectedPiece: { row: number, col: number } | null = null;
  validMoves: Position[] = [];

  constructor(private moveValidator: MoveValidatorService) {}

  onCellClick(row: number, col: number) {
    if (this.playerView !== this.currentPlayer) return;

    const cell = this.board[row][col];

    // When haven't select any piece
    if (!this.selectedPiece){
      if (!cell || cell.color !== this.currentPlayer) return;
      this.selectedPiece = { row, col };
      this.validMoves = this.getValidMoves(row, col);
      return;
    }

    // When a piece is selected
    this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
    this.selectedPiece = null;
    this.validMoves = [];
  }

  movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    if (!this.moveValidator.isValidMove(fromRow, fromCol, toRow, toCol, this.board)) return;

    // Define request
    const from: Position = {row: fromRow, col: fromCol}
    const to: Position = {row: toRow, col: toCol}
    const moveRequest: MoveRequest = {from: from,to: to};

    this.move.emit(moveRequest);
  }

  getValidMoves(row: number, col: number): Position[] {
    const moves: Position[] = [];
    // Check all possible board positions
    for (let r = 0; r < this.board.length; r++) {
      for (let c = 0; c < this.board[0].length; c++) {
        if (this.moveValidator.isValidMove(row, col, r, c, this.board)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  isValidMove(row: number, col: number): boolean {
    return this.validMoves.some(move => move.row === row && move.col === col);
  }

} 
