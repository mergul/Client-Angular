import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {UserService} from '../core/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../core/auth.service';
import { NewsService } from '../core/news.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { WindowRef } from '../core/window.service';

@Component({
  selector: 'app-logged-nav',
  templateUrl: './logged-nav.component.html',
  styleUrls: ['./logged-nav.component.scss']
})
export class LoggedNavComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  @Output() logChange: EventEmitter<Observable<boolean>>;
  toolbarStyle = {};
  private _logged: boolean;
  checkMedia = false;
  constructor(public newsService: NewsService, private winRef: WindowRef,
              public service: UserService, private router: Router, public authService: AuthService
              , private reactiveService: ReactiveStreamsService) { 
                this.logChange = this.authService.changeEmitter;
              }

  @Input()
  get logged(): boolean {
    return this._logged;
  }
  set logged(value: boolean) {
    this._logged = value;
  }
  get image(): string {
    return this.service.prof_url;
  }
  get role() {
    if (this.service.dbUser) {
      return this.service.dbUser.roles[0];
    }
  }
  ngOnInit() {
    this.checkMedia = this.winRef.nativeWindow.innerWidth < 600;
  }
  btnClick(url: string) {
    this.newsService.preModalUrl = this.router.url;
    this.router.navigateByUrl(url, {state: {loggedID: this.service._loggedUser.id}});
  }
  logout() {
    this.changeChild(false);
    if (this.router.url === '/home'||this.router.url === '/user') {
      this.newsService.callToggle.next(this.newsService.links.indexOf(this.newsService.activeLink));
      this.newsService.callTag.next(this.newsService.links[0]);
    }
    setTimeout(() => {
      this.authService.doLogout()
      .then(() => {
        this.service._loggedUser = null;
        this.service.user = null;
        this.reactiveService.resetNavListListeners('@' + this.service.dbUser.id)
        for (const tag of this.service.dbUser.tags) {
           this.reactiveService.resetUserListListeners('#' + tag);
        }
        for (const tag of this.service.dbUser.users) {
          this.reactiveService.resetUserListListeners('@' + tag, true);
       }
        this.service.dbUser = null;
        this.service.newsCo.clear();
        this.newsService.activeLink = this.newsService.links[0];
        this.router.navigateByUrl('/home');
      }, () => {
      });
    }, 50);
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
  changeChild(value: boolean) {
    this.logChange.emit(of(value));
    console.log('changeChild --> '+value);
  }
}
