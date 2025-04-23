import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-match-cancel-modal',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './match-cancel-modal.component.html',
  styleUrls: ['./match-cancel-modal.component.css']
})
export class MatchCancelModalComponent {
  constructor(
    public dialogRef: MatDialogRef<MatchCancelModalComponent>
  ) {}

  onPlayAgain() {
    this.dialogRef.close(true);
  }
  
  onBack() {
    this.dialogRef.close(true);
  }
}