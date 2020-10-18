import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import { NewsService } from '../core/news.service';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/internal/Observable';
import { WindowRef } from '../core/window.service';

@Component({
  selector: 'app-no-logged-nav',
  templateUrl: './no-logged-nav.component.html',
  styleUrls: ['./no-logged-nav.component.scss']
})
export class NoLoggedNavComponent implements OnInit, OnDestroy {
  _loggedinUser = of(true);
  toolbarStyle: { marginLeft: string; marginRight: string; float: string; width: string };
  checkMedia = false;
  constructor(private router: Router, private winRef: WindowRef,
    public newsService: NewsService) {
  }
  @Input()
  get loggedinUser(): Observable<boolean> {
    return this._loggedinUser;
  }

  set loggedinUser(value: Observable<boolean>) {
    this._loggedinUser = value;

  }

  ngOnInit() {
    this.checkMedia = this.winRef.nativeWindow.innerWidth < 600;
    this.toolbarStyle = {
      marginLeft: `${this.checkMedia ? 0 : 130}px`,
      marginRight: this.checkMedia ? '0px' : 'auto',
      float: 'right',
      width: 'auto'
     };
  }
  btnClick(url: string) {
    this.router.navigateByUrl(url);
  }

  ngOnDestroy(): void {
  }
}
