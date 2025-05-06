import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
  imports: [NgFor, FormsModule, NgClass],
  templateUrl: './game-sidebar.component.html',
  styleUrl: './game-sidebar.component.css'
})
export class GameSidebarComponent implements OnInit, OnDestroy{
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
  chatSubscription: any;

  constructor(private wsService: WebsocketService) {}

  async ngOnInit() {
    // Listen for chat messages from WebSocket
    this.chatSubscription = await this.wsService.listenToChat(this.matchId, responseObject => {
      if (responseObject.status === 'ok' && responseObject.message == "Message received.") {
        this.chatMessages.push({
          sender: responseObject.data.sender,
          message: responseObject.data.message,
          timestamp: new Date(responseObject.data.timestamp).toLocaleTimeString()
        })
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.wsService.sendChatMessage(this.matchId, this.newMessage, this.playerName);
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }
}