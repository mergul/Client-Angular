import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { first, mergeMap, switchMap } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";

@Injectable({ providedIn: 'root' })
export class AuthsGuard implements CanActivate {

    constructor(private userService: UserService, private router: Router, private authService: AuthService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        if (!this.userService.dbUser) {
            return this.authService.isLoggedIn().pipe(first(), switchMap(logged => {
                if (logged) {
                    if (state.url === '/login' || state.url === '/register' || state.url === '/loginin') {
                        this.router.navigate(['/user']);
                    }
                    if (state.url === '/upload') {
                        return this.authService.getUser().pipe(mergeMap(us => {
                                this.userService._loggedUser = this.userService.user;
                                this.userService._loggedUser.id = this.userService.user.id = this.userService.createId(us.uid);
                                this.userService.setReactiveListeners();
                                return forkJoin([this.userService.getDbUser('/api/rest/start/user/' + this.userService.user.id + '/' + this.userService.getRandom()), this.authService.token]);
                        }), switchMap(tokens=>{
                            this.userService.setDbUser(tokens[0]);
                            this.userService.user.token = tokens[1];
                            this.authService.changeEmitter.next(of(true));
                            return this.router.navigate([this.userService.redirectUrl]);
                        }));
                    }
                } else {
                    if (state.url === '/upload') {
                        this.userService.redirectUrl = '/upload';
                        this.router.navigate(['/loginin']);
                    }
                    return of(true);
                }
            }));
        } else return of(true);
    }
}