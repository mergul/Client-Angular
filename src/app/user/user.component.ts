import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FirebaseUserModel, User } from '../core/user.model';
import { NewsService } from '../core/news.service';
import { Observable, of, Subject } from 'rxjs';
import { WindowRef } from '../core/window.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
    selector: 'app-page-user',
    templateUrl: 'user.component.html',
    styleUrls: ['user.scss']
})
export class UserComponent implements OnInit, OnDestroy {

    private readonly onDestroy = new Subject<void>();
    listStyle = {};
    compStyle = {};
    user: FirebaseUserModel = new FirebaseUserModel();
    _newsCounts: Map<string, string> = new Map<string, string>();
    _userIds: string[] = [];
    private _boolUser: Observable<number> = of(0);
    private _tags: Observable<Array<string>>;
    _isPub: Observable<boolean> = of(false);

    constructor(
        public userService: UserService,
        public authService: AuthService,
        private route: ActivatedRoute,
        public location: Location,
        private winRef: WindowRef,
        private router: Router, private service: NewsService) {
    }

    ngOnInit(): void {
        this.boolUser = this.location.path() === '/user/edit' ? of(1) : of(0);
        const myWis = this.winRef.nativeWindow.innerWidth;
        this.listStyle = {
            width: `${(myWis) / 3.5}px`,
            marginRight: `${3 * (myWis) / 350}px`,
            display: `${(myWis > 780) ? 'block' : 'none'}`
        };
        const mwidth = myWis > 620 ? 620 : myWis;
        this.compStyle = {
            width: `${mwidth}px`
        };
        if (!this.userService.dbUser || this.userService.dbUser.id.length !== 24) {
            this.route.data.pipe(takeUntil(this.onDestroy)).subscribe(routeData => {
                const data = routeData['data'];
                //           this.boolUser = this.location.path() === '/user/edit' ? of(1) : of(0);
                if (data) {
                    this.user = data;
                    this.user.provider = 'auth';
                    this.userService.loggedUser = this.user;
                }
            });
        }
    }

    ngOnDestroy(): void {
            this.onDestroy.next();
            this.onDestroy.complete();
    }
    get balance() {
        return this.userService._totalBalance;
    }
    get newsCounts(): Map<string, string> {
        return this.service.newsCounts;
    }

    set newsCounts(newsCounts: Map<string, string>) {
        this._newsCounts = newsCounts;
    }

    get loggedUser(): User {
        return this.userService.dbUser;
    }

    get tags(): Observable<Array<string>> {
        return this._tags;
    }

    set tags(value: Observable<Array<string>>) {
        this._tags = value;
    }

    tagClick(id: string) {
        this.userService.manageFollowingTag(id, true).pipe(takeUntil(this.onDestroy)).subscribe();
    }

    btnClick() {
        const url = '/user/edit';
        this.boolUser = of(1);
        return this.router.navigateByUrl(url);
    }
    moneyClick() {
        return this.router.navigateByUrl('/money');
    }
    proClick(people: string[]) {
        // return this.router.navigateByUrl('/profiles/' + people);
        this._userIds = people;
        this.boolUser = of(2);
    }

    get desc(): Observable<string> {
        return of(this.userService.dbUser.summary);
    }

    get boolUser(): Observable<number> {
        return this._boolUser;
    }

    set boolUser(value: Observable<number>) {
        this._boolUser = value;
    }

    followTags() {
        this.tags = of(this.loggedUser.tags);
        this.boolUser = of(3);
    }

    checkOut() {
        this.userService.checkOut(this.loggedUser).pipe(takeUntil(this.onDestroy)).subscribe(q => alert(q + '---Talebiniz Alındı!'));
    }
    deleteClick() {
        if (window.confirm('Are sure you want to delete this item ?')) {
            console.log('Implement delete functionality here');
            // this.userService.deleteUser(this.loggedUser).subscribe();
        }
    }
}
