import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { NewsService } from '../core/news.service';
import { Observable, of, Subject } from 'rxjs';
import { User } from '../core/user.model';
import { NewsPayload } from '../core/news.model';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ReactiveStreamsService } from '../core/reactive-streams.service';

@Component({
  selector: 'app-profile-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-center.component.html',
  styleUrls: ['./profile-center.component.scss']
})
export class ProfileCenterComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  private _isPub: Observable<boolean>;
  _user: User;
  public _newsList: Observable<NewsPayload[]>;
  _username: string;
  _boolUser: Observable<number>;
  orderBy = 'date';
  _userIds: string[] = [];
  _users: Observable<Array<User>>;
  _tagz: Observable<Array<string>>;
  private newslistUrl: string;
  message: any;

  constructor(public userService: UserService,
    private reactiveService: ReactiveStreamsService,
    public service: NewsService) {
    if (!this.reactiveService.random) {
      this.reactiveService.random = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    }
    this.newslistUrl = '/sse/chat/room/TopNews' + this.reactiveService.random + '/subscribeMessages';
  }

  @Input()
  get user(): User {
    return this._user;
  }

  set user(value: User) {
    this._user = value;
  }
  @Input()
  get userIds(): string[] {
    return this._userIds;
  }

  set userIds(value: string[]) {
    this._userIds = value;
    if (value.length > 0) { this.users = this.userService.getUsers(this.userIds); }
    else { this.users = of([])}
  }

  @Input()
  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }
  @Input()
  get boolUser(): Observable<number> {
    return this._boolUser;
  }

  set boolUser(value: Observable<number>) {
    this._boolUser = value;
  }
  @Input()
  get tagz(): Observable<Array<string>> {
    return this._tagz;
  }

  set tagz(value: Observable<Array<string>>) {
    this._tagz = value;
  }
  @Input()
  get isPub(): Observable<boolean> {
    return this._isPub;
  }

  set isPub(value: Observable<boolean>) {
    this._isPub = value;
  }
  get newsCounts(): Map<string, string> {
    return this.service.newsCounts;
  }

  ngOnInit() {
    if (!this.reactiveService.statusOfNewsSource()) {
      this.reactiveService.getNewsStream(this.reactiveService.random, this.newslistUrl);
    }
    this._isPub.pipe(takeUntil(this.onDestroy), switchMap(value2 => {
      if (!value2) {
        if (!this.service.meStreamList$) {
          this.service.meStreamList$ = this.reactiveService.getMessage('me');
        }
        this._newsList = this.service.meStreamList$;
      } else {
          this._newsList = this.reactiveService.getMessage('other-person');
      }
      return this._newsList;
    })).subscribe();
  }

  get users(): Observable<Array<User>> {
    return this._users;
  }

  set users(value: Observable<Array<User>>) {
    this._users = value;
  }

  getNewsByOwner(username: string) {
    this.orderBy = 'date';
    this.service.setNewsList(['@' + username], true);
  }
  getNewsByTopHundred(username: string) {
    this.orderBy = 'count';
    this.service.setNewsList(['@' + username], true);
  }

  getNewsByOwnerOlder(username: string) {
    this.orderBy = '';
    this.service.setNewsList(['@' + username], true);
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
  receiveMessage($event) {
    this.boolUser = $event;
  }
}
