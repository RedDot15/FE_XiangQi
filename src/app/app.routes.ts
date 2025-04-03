import { Routes,mapToCanActivate } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { AppGuard } from './app.guard';
export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "",
        component:LayoutComponent,
        canActivate: mapToCanActivate([AppGuard]),
        children:[
            { path:'',title:"Trang chủ", loadComponent: () => import("./pages/home-page/home-page.component").then((response) => response.HomePageComponent) },
            { path:'play/PvP',title:"Mời người chơi trực tuyến", loadComponent: () => import("./pages/play-pvp/play-pvp.component").then((response) => response.PlayPvpComponent) },
            { path: "play/computer", title: "Chơi với máy", loadComponent: () => import("./pages/play-computer/play-computer.component").then((response) => response.PlayComputerComponent) },
            { path:'leader-board', title:"Bảng xếp hạng", loadComponent: () => import("./pages/leader-board/leader-board.component").then((response) => response.LeaderBoardComponent) },
            { path: 'match/:id', title: 'Ván đấu', loadComponent: () => import('./pages/match/match.component').then((response) => response.MatchComponent) },
        ]
    },
    
];
