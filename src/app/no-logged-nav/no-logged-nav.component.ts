import {Component, Input, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {UserService} from '../core/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../core/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-no-logged-nav',
  templateUrl: './no-logged-nav.component.html',
  styleUrls: ['./no-logged-nav.component.scss']
})
export class NoLoggedNavComponent implements OnInit, OnDestroy {
  _logged = true;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(public changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private router: Router, public authService: AuthService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  @Input()
  get logged(): boolean {
    return this._logged;
  }

  set logged(value: boolean) {
    this._logged = value;
  }
  ngOnInit() {
  }
  btnClick(url: string) {
    this.router.navigateByUrl(url);
  }
  // searchWrapperStyle(logged: boolean) {
  //   return { marginRight: `${!logged ? 15 : 15}%`};
  // }
  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
