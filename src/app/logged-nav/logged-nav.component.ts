import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {UserService} from '../core/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../core/auth.service';
import {MediaMatcher} from '@angular/cdk/layout';
import { NewsService } from '../core/news.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';

@Component({
  selector: 'app-logged-nav',
  templateUrl: './logged-nav.component.html',
  styleUrls: ['./logged-nav.component.scss']
})
export class LoggedNavComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  get image(): string {
    return this.service.prof_url;
  }
  get role() {
    if (this.service.dbUser) {
      return this.service.dbUser.roles[0];
    }
  }

  mobileQuery: MediaQueryList;
  _loggedinUser = of(true);
  private _mobileQueryListener: () => void;
  constructor(public changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public newsService: NewsService,
              public service: UserService, private router: Router, public authService: AuthService
              , private reactiveService: ReactiveStreamsService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  @Input()
  get loggedinUser(): Observable<boolean> {
    return this._loggedinUser;
  }

  set loggedinUser(value: Observable<boolean>) {
    this._loggedinUser = value;

  }
  ngOnInit() {

  }
  btnClick(url: string) {
    this.router.navigateByUrl(url);
  }
  logout() {
    this.authService.doLogout()
        .then(() => {
          this.service.loggedUser = null;
          this.service.user = null;
          for (const tag of this.service.dbUser.tags) {
             this.reactiveService.resetUserListListeners('#' + tag);
          }
          for (const tag of this.service.dbUser.users) {
            this.reactiveService.resetUserListListeners('@' + tag);
         }
          this.service.dbUser = null;
          this.service.newsCo.clear();
          this.router.navigateByUrl('/');
        }, () => {
        //  console.log('Logout error', error);
        });
  }
  // searchWrapperStyle(logged: boolean) {
  //   return { marginRight: `${!logged ? 15 : 15}%`};
  // }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
