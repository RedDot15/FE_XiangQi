import { Component, Input } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../service/websocket.service';

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-game-sidebar',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, NgClass],
  templateUrl: './game-sidebar.component.html',
  styleUrl: './game-sidebar.component.css'
})
export class GameSidebarComponent {
  @Input() currentPlayer: 'red' | 'black' = 'red';
  @Input() playerView: 'red' | 'black' = 'red';
  @Input() matchId: string = '-1';
  @Input() opponentName: string = "Opponent";
  @Input() playerName: string = "Me";
  @Input() opponentRating: number = 1200;
  @Input() playerRating: number = 1200;
  @Input() redPlayerTotalTimeLeft: number = 900; // 15 minutes in seconds
  @Input() blackPlayerTotalTimeLeft: number = 900;
  @Input() redPlayerTurnTimeLeft: number = 2*60; // 2 minutes in seconds
  @Input() blackPlayerTurnTimeLeft: number = 2*60;

  chatMessages: ChatMessage[] = [];
  newMessage: string = '';

  constructor(private wsService: WebsocketService) {}

  ngOnInit() {
    // // Listen for chat messages from WebSocket
    // this.wsService.listenToChat(this.matchId).subscribe((message: any) => {
    //   if (message.status === 'ok' && message.data) {
    //     this.chatMessages.push({
    //       sender: message.data.sender,
    //       message: message.data.message,
    //       timestamp: new Date(message.data.timestamp).toLocaleTimeString()
    //     });
    //   }
    // });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  sendMessage() {
    // if (this.newMessage.trim()) {
    //   this.wsService.sendChatMessage(this.matchId, this.newMessage);
    //   this.newMessage = '';
    // }
  }
}