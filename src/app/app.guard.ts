import { Injectable } from "@angular/core";
import { AuthService } from "./service/auth.service";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AppGuard {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    async canActivate() {
        if (await this.authService.authenticated()) { 
            return true; 
        }
        // token không hợp lệ, đưa người dùng về trang login
        this.router.navigate(["login"])
        return false;
    }
}
