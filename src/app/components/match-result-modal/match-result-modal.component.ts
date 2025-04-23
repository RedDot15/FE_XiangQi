import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-match-result-modal',
  standalone: true,
  imports: [MatButtonModule, NgClass],
  templateUrl: './match-result-modal.component.html',
  styleUrls: ['./match-result-modal.component.css']
})
export class MatchResultModalComponent {
result: 'WIN' | 'LOSE' = 'WIN';
ratingChange: number = 0;

  constructor(public dialogRef: MatDialogRef<MatchResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { result: 'WIN' | 'LOSE', ratingChange: number} 
  ) {
    this.result = data.result;
    this.ratingChange = data.ratingChange;
  }

  onPlayAgain() {
    this.dialogRef.close(true);
  }
  
  onBack() {
    this.dialogRef.close(true);
  }
}