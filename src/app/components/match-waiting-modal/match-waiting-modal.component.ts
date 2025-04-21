import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@Component({
  selector: 'app-match-waiting-modal',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './match-waiting-modal.component.html',
  styleUrl: './match-waiting-modal.component.css'
})
export class MatchWaitingModalComponent {
  constructor(public dialogRef: MatDialogRef<MatchWaitingModalComponent>) {}
}
