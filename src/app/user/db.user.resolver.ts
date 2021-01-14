import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { User } from "firebase";
import { Observable } from "rxjs";
import { first, map } from "rxjs/operators";
import { AuthService } from "../core/auth.service";

@Injectable({ providedIn: 'root' })
export class DbUserResolver implements Resolve<User> {

    constructor(private authService: AuthService, private router: Router) {
    }
    resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): User | Observable<User> | Promise<User> {
        return this.authService.getUser().pipe(first(), map(logged => {
            if (logged!==null) { return logged; }
            this.router.navigate(['home']);
        }));
    }
}