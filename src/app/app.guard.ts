import { Injectable } from "@angular/core";
import { AuthService } from "./service/auth.service";

@Injectable({ providedIn: "root" })
export class AppGuard {
    constructor(private authService: AuthService) { }

    async canActivate() {
        if (await this.authService.authenticated()) { return true; }
        this.authService.login();
        return false;
    }
}
