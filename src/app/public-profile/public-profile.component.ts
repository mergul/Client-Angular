import { Component, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of, Subscription, Subject } from 'rxjs';
import { NewsService } from '../core/news.service';
import { map, takeUntil } from 'rxjs/operators';
import { News} from '../core/news.model';
import { UserService } from '../core/user.service';
import { Location } from '@angular/common';
import { FirebaseUserModel, User } from '../core/user.model';
import { DomSanitizer } from '@angular/platform-browser';
import { BackendServiceService } from '../core/backend-service.service';
import { WindowRef } from '../core/window.service';

@Component({
    selector: 'app-public-profile',
    templateUrl: './public.profile.component.html',
    styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit, OnDestroy, AfterViewInit {

    private readonly onDestroy = new Subject<void>();
    _isPub = of(true);
    private _prof_url = '/assets/profile-img.jpeg';
    private _back_url = '/assets/back-img.jpeg';
    _userIds: string[] = [];
    folli: boolean;
    private _tags: Observable<Array<string>>;
    subscription_newslist: Subscription;

    constructor(public userService: UserService,
        private route: ActivatedRoute,
        private location: Location, private winRef: WindowRef,
        public service: NewsService, public domSanitizer: DomSanitizer) {
        // this.router.routeReuseStrategy.shouldReuseRoute = function () {
        //     return false;
        // };
    }

    @Input()
    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get newsCounts(): Map<string, string> {
        return this.service.newsCounts;
    }

    _user: Observable<User>;
    _username: string;
    orderBy = 'date';
    userID: string;
    _boolUser: Observable<number> = of(0);
    controller = new AbortController();
    signal = this.controller.signal;
    public loggedID = '';
    listStyle = {};
    compStyle = {};

    ngOnInit() {
        this.loggedID = window.history.state.loggedID;
        this._username = window.history.state.userID;
        this._user = this.userService._otherUser;
        const myWis = this.winRef.nativeWindow.innerWidth;
        this.listStyle = {
            width: `${(myWis) / 3.5}px`,
            marginRight: `${3 * (myWis) / 350}px`,
            display: `${(myWis > 1080) ? 'block' : 'none'}`
        };
        const mwidth = myWis > 620 ? 620 : myWis;
        this.compStyle = {
            width: `${mwidth}px`
        };
        if (!this._username) {
            this.route.paramMap.pipe(takeUntil(this.onDestroy)).subscribe((params: ParamMap) => {
                this._username = params.get('id');
                this.username = this._username.includes('@') ? this._username : '#' + this._username;
                this.setThat();
            });
        } else {
            this.setThat();
        }
    }

    private setThat() {
        this.loggedID = this.loggedID ? this.loggedID : '';
        if (!this.userService._otherUser) {
            this._user = this.userService._otherUser = this.findMother();
        }
    }

    tagClick(user: User) {
      //  const fet = ['people'];
        if (!this.folli) {
            this.userService.manageFollowingTag('@' + user.id, true).pipe(takeUntil(this.onDestroy)).subscribe(value => {
                this.folli = value;
                user.followers.push(this.userService.dbUser.id);
                this.userService.dbUser.users.push(user.id);
                this.userService.newsCo.get(this.userService.links[2]).push('@' + user.id);
                this._user = of(user);
            });
            // this.userService.dbUser.users.forEach(usr => fet.push(encodeURIComponent('@' + usr)));
            // fet.push(encodeURIComponent('@' + user.id));
            // fet.push(encodeURIComponent('@' + this.userService.dbUser.id));
        } else {
            this.userService.manageFollowingTag('@' + user.id, false).pipe(takeUntil(this.onDestroy)).subscribe(value => {
                this.folli = !value;
                const ind = user.followers.indexOf(this.userService.dbUser.id);
                user.followers.splice(ind, 1);
                this.userService.dbUser.users.splice(this.userService.dbUser.users.indexOf(user.id), 1);
                this.userService.newsCo.get(this.userService.links[2]).splice(ind, 1);
                this._user = of(user);
            });
            // this.userService.dbUser.users.forEach(usr => {
            //     if (usr !== user.id) { fet.push(encodeURIComponent('@' + usr)); }
            // });
            // fet.push(encodeURIComponent('@' + this.userService.dbUser.id));
        }
       // this.subscription_newslist = this.userService.setInterests(fet).pipe(takeUntil(this.onDestroy)).subscribe();
    }

    getNewsByOwner(userId: string): Observable<Array<News>> {
        this.orderBy = 'date';
        return this.service.getNewsByOwnerId(userId);
    }
    ngAfterViewInit(): void {
        if (!this.userService.loggedUser) {
            this.userService.getCurrentUser()
                .then(value => {
                    if (value) {
                        this.userService.user = new FirebaseUserModel();
                        this.userService.user.image = value.providerData[0].photoURL;
                        this.userService.user.email = value.providerData[0].email;
                        this.userService.user.name = value.displayName;
                        this.userService.user.id = value.uid;
                        this.userService.user.token = value['ra'];
                        value.getIdToken().then(idToken => {
                            this.userService.user.token = idToken;
                        });
                        this.userService.loggedUser = this.userService.user;
                        this.loggedID = this.loggedID ? this.loggedID : value.uid.substring(0, 12);
                        if (!this.userService._otherUser) {
                            this._user = this.userService._otherUser = this.findMother();
                        }
                    }
                }).catch(reason => {
                  //  console.log('Bu mu dur', reason);
                    this.loggedID = '';
                    if (!this.userService._otherUser) {
                        this._user = this.userService._otherUser = this.findMother();
                    }
                });

        }
    }
    ngOnDestroy() {
        if (!this.location.path().includes('/allusers')) { this.userService._otherUser = null; }
        this.onDestroy.next();
        this.onDestroy.complete();
    }
    get prof_url(): string {
        return this._prof_url;
    }

    set prof_url(value: string) {
        this._prof_url = value;
    }

    get back_url(): string {
        return this._back_url;
    }

    set back_url(value: string) {
        this._back_url = value;
    }
    get boolUser(): Observable<number> {
        return this._boolUser;
    }

    set boolUser(value: Observable<number>) {
        this._boolUser = value;
    }
    proClick(people: string[]) {
        // return this.router.navigateByUrl('/profiles/' + people);
        this._userIds = people;
        this.boolUser = of(2);
    }

    roleClick(userd: User) {
        if (userd.roles.includes('ROLE_USER')) {
            userd.roles = ['ROLE_MODERATOR'];
        } else {
            userd.roles = ['ROLE_USER'];
        }
        this.userService.updateUser(userd).pipe(takeUntil(this.onDestroy)).subscribe();
    }

    deleteClick(userd: User) {
        this.userService.deleteUser(userd).pipe(takeUntil(this.onDestroy)).subscribe();
    }
    blockClick(userd: User) {
        this.userService.blockUser(userd, this.userService.dbUser.blocked.includes(userd.id)).pipe(takeUntil(this.onDestroy)).subscribe();
    }
    private findMother(): Observable<User> {
        if (this.userService._otherUser) { return this._user; } else {
            return this.userService
                .getDbUser('/api/rest/users/get/' + encodeURIComponent(this._username), this.loggedID)
                .pipe(map(user => {
                    if (user.id) {
                        this.userID = user.id;
                        const leng = user.mediaParts.length;
                        user.mediaParts.forEach(thumb => {
                            const img = thumb === 1 ? 'back-img.jpeg' : 'profile-img.jpeg';
                            if (thumb === 1) {
                                this.back_url = 'https://storage.googleapis.com/sentral-news-media/' + user.id + '-' + img;
                                if (leng === 1) {
                                    this.prof_url = 'https://storage.googleapis.com/sentral-news-media/' + img;
                                }
                            } else if (thumb === 0) {
                                this.prof_url = 'https://storage.googleapis.com/sentral-news-media/' + user.id + '-' + img;
                                if (leng === 1) {
                                    this.back_url = 'https://storage.googleapis.com/sentral-news-media/' + img;
                                }
                            }
                        });
                        if (leng === 0) {
                            this.prof_url = '/assets/' // 'https://storage.googleapis.com/sentral-news-media/'
                                + 'profile-img.jpeg'; // this.loggedUser.image;
                            this.back_url = '/assets/' // 'https://storage.googleapis.com/sentral-news-media/'
                                + 'back-img.jpeg';
                        }
                        this.folli = this.userService.loggedUser != null && this.userService.loggedUser.people.includes(user.id);
                        this.boolUser = of(0);
                        //  this.getUsersByCounts(this.userID);
                        //   this.newsList$ = this.service.getNewsByOwnerId(this.userID);
                    } else {
                        this.prof_url = 'https://storage.googleapis.com/sentral-news-media/' + 'profile-img.jpeg';
                        this.back_url = 'https://storage.googleapis.com/sentral-news-media/' + 'back-img.jpeg';
                        this.boolUser = of(0);
                    }
                    return user;
                }));
        }
    }
    get tags(): Observable<Array<string>> {
        return this._tags;
    }

    set tags(value: Observable<Array<string>>) {
        this._tags = value;
    }
    followTags(tagst: string[]) {
        this.tags = of(tagst);
        this.boolUser = of(3);
    }
}
