import {Injectable, OnDestroy} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {UserService} from '../core/user.service';
import {FirebaseUserModel} from './user.model';
import {AuthService} from './auth.service';
import { ReactiveStreamsService } from './reactive-streams.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate, OnDestroy {

    fuser: FirebaseUserModel = new FirebaseUserModel();
    private readonly onDestroy = new Subject<void>();

    constructor(public userService: UserService, private router: Router, private authService: AuthService, private reactiveService: ReactiveStreamsService) {
    }
    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
      }
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.userService.user && this.userService.user.token) {
                this.authService.getCurrentIdToken().then(token => {
                    this.userService.user.token = token;
                });
                return resolve(true);
            } else if (this.userService.dbUser) {
                this.authService.getCurrentIdToken().then(token => {
                    this.userService.user.token = token;
                    if (state.url === '/talepler' && this.userService.dbUser.roles.includes('ROLE_ADMIN')) {
                        return resolve(true);
                    } else if (state.url !== '/talepler' && this.userService.dbUser.roles.includes('ROLE_ADMIN')
                        || this.userService.dbUser.roles.includes('ROLE_MODERATOR')) {
                        return resolve(true);
                    } else { return resolve(false); }
                });
            } else {
                this.authService.getCurrentUser()
                    .then(user => {
                        if (user.providerData.length === 0) {
                            return resolve(true);
                        }
                        this.fuser.image = user.providerData[0].photoURL;
                        this.fuser.email = user.providerData[0].email;
                        this.fuser.name = user.displayName;
                        this.fuser.id = user.uid;
                        if (state.url !== '/admin' && state.url !== '/talepler' && state.url !== '/money') {
                            this.userService.loggedUser = this.fuser;
                            if (state.url === '/loginin') {
                                this.router.navigate([this.userService.redirectUrl]);
                            } else if (state.url === '/login') {
                                this.router.navigate(['/user']);
                            } else if (state.url === '/upload') {
                                return resolve(true);
                            }
                            return resolve(false);
                        } else {
                            this.userService._loggedUser = this.fuser;
                            this.reactiveService.setListeners('@' + Array.prototype.slice.call(([...Buffer
                                .from(this.fuser.id.substring(0, 12))])).map(this.userService.hex.bind(this, 2)).join('')
                                , this.reactiveService.random);
                            user.getIdToken().then(idToken => {
                                this.userService.user.token = idToken;
                                this.userService.getDbUser('/api/rest/user/' + user.uid.substring(0, 12) + '/'
                                 + this.reactiveService.random).pipe(takeUntil(this.onDestroy)).subscribe(value => {
                                    this.userService.setDbUser(value);
                                    if (state.url === '/talepler' && value.roles.includes('ROLE_ADMIN')) {
                                        return resolve(true);
                                    } else if (state.url !== '/talepler' && value.roles.includes('ROLE_ADMIN')
                                        || value.roles.includes('ROLE_MODERATOR')) {
                                        return resolve(true);
                                    } else {
                                        this.router.navigate(['/home']);
                                    }
                                });
                            });
                        }
                    }, () => {
                        if (state.url === '/upload') {
                            this.userService.redirectUrl = '/upload';
                            this.router.navigate(['/loginin']);
                        } else if (state.url === '/admin' || state.url === '/talepler' || state.url === '/money'
                        || (state.url !== '/register' && state.url !== '/login' && state.url !== '/loginin'
                        && this.userService.redirectUrl === '/home')) {
                            this.router.navigate(['/home']);
                        }
                        return resolve(true);
                    });
            }
        });
    }
}
