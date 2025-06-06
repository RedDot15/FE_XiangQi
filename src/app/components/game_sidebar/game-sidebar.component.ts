import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../service/websocket.service';
import {ChatService} from "../../service/chat.service";

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

  constructor(
    private wsService: WebsocketService,
    private chatService: ChatService) {}

  async ngOnInit() {
    // Listen for chat messages from WebSocket
    this.chatSubscription = await this.wsService.listenToChat(this.matchId, messageObject => {
      if (messageObject.message == "Chat message received.") {
        this.chatMessages.push({
          sender: messageObject.data.sender,
          message: messageObject.data.message,
          timestamp: new Date(messageObject.data.timestamp).toLocaleTimeString()
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
      this.chatService.sendChat({
        matchId: this.matchId,
        sender: this.playerName,
        message: this.newMessage,
      });
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }
}
