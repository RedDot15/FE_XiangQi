import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../service/match.service';
import { MatchResponse } from '../../models/response/match.response';
import { WebsocketService } from '../../service/websocket.service';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from '../../service/cookie.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs';
import { HistoryService } from '../../service/history.service';
import {InvitationService} from "../../service/invitation.service";
import {OnlinePlayerService} from "../../service/online-player.service";

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [
      NgFor,
      NgIf,
      NgClass,
      CommonModule
    ],
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
    matches: MatchResponse[] = [];
    currentPage: number = 1;
    totalPages: number = 1;
    pageSize: number = 10;
    pages: number[] = [];
    userId: string | null = null;

    constructor(
        private historyService: HistoryService,
        private onlinePlayerService: OnlinePlayerService,
        private route: ActivatedRoute,) {}

    ngOnInit(): void {
        // Wait for WebSocket connection before setting status
        this.onlinePlayerService.setStatus('IDLE');

        // Theo dõi sự thay đổi của tham số route để cập nhật data
        this.route.paramMap.subscribe((params: ParamMap) => {
            this.userId = params.get('id');
            this.currentPage = 1; // Đặt lại trang về 1 khi userId thay đổi
            this.loadMatches();
        });
    }

    async loadMatches() {
        // Get the user ID from the route parameters
        this.userId = this.route.snapshot.paramMap.get('id')!;
        // Get match-history
        const res = await this.historyService.getAllByUserId(this.currentPage, this.pageSize, Number(this.userId));
        // Binding data
        this.matches = res.data.content;
        this.totalPages = res.data.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    changePage(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }
        this.currentPage = page;
        this.loadMatches();
    }
}
