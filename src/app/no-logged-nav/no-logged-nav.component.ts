import {Component, Input, OnInit, OnDestroy, Renderer2, ElementRef, ViewChildren, QueryList} from '@angular/core';
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
  toolbarStyle: { marginLeft: string; 
    //marginRight: string; 
  //  paddingLeft: string;
   //  float: string;
   maxWidth: string;
   minWidth: string };
  checkMedia = false;
  @ViewChildren("buttons", { read: ElementRef }) buttons: QueryList<ElementRef>;  
  
  constructor(private router: Router, private winRef: WindowRef,
    public newsService: NewsService, private renderer: Renderer2) {
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
    //  paddingLeft: `${this.checkMedia ? 0 : 8}%`,
       marginLeft: `${this.checkMedia ? 0 : 0}%`,
      // marginRight: this.checkMedia ? '0px' : '0px',
 //     float: 'right',
      maxWidth: `${this.checkMedia ? 0 : 30}%`,
      minWidth: `${this.checkMedia ? 0 : 30}%`
     };
  }
  btnClick(url: string) {
    this.router.navigateByUrl(url);
  }
  navClick(link: string) {
    const ind=this.newsService.links.indexOf(link);
    const curr=this.newsService.links.indexOf(this.newsService.activeLink);
    this.buttons.forEach((el, index) => {
      if (ind===index) {
        this.renderer.addClass(el.nativeElement, 'active');
      } else if (index===curr) {
        this.renderer.removeClass(el.nativeElement, 'active');
      }
    });
    if (this.router.url!== '/home') {
      this.newsService.activeLink = link;
      this.router.navigateByUrl('/home');
    } else this.newsService.callToggle.next(curr-ind);
  }
  ngOnDestroy(): void {
  }
  get activeLink(): string {
    return this.newsService.activeLink;
}

set activeLink(value: string) {
    this.newsService.activeLink = value;
}
}
