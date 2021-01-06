import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewsPayload } from '../core/news.model';
import { NewsService } from '../core/news.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { User } from '../core/user.model';
import { UserService } from '../core/user.service';
import { WindowRef } from '../core/window.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, AfterViewInit {
  _url: any;
  _news: NewsPayload;
  othersList$: NewsPayload[];
  thumbHeight = 109;
  fontSize = 12;
  height = 109;
  commUrl: string;
  id='';
  _isDisabled:boolean;
  name: string;
  user: Observable<User>;

  constructor(private userService: UserService, private newsService: NewsService
    ,private router: Router, private reactiveService: ReactiveStreamsService, private winRef: WindowRef) { }


  ngOnInit(): void {
    if (this.winRef.nativeWindow.innerWidth < 1080) {
      this.height = this.thumbHeight * (4 / 5);
      this.thumbHeight = this.height - 19;
      this.fontSize = 9;
    } else {
      this.thumbHeight = this.thumbHeight - 19;
    }
    this.user=this.userService._me;
  }
  @Input()
  get news() {
    return this._news;
  }

  set news(news: NewsPayload) {
    this._news = news;
    this._url = 'url(' + news.ownerUrl + ')';
  }
  ngAfterViewInit(): void {
    this.user.pipe(map(muser=>{
      if (muser!=null) {
        this.commUrl='url(' +muser.image + ')';
        this.id=muser.id;
        this.name=muser.firstname;
      }
    }));
  }
  onDetails(url){
    this.router.navigateByUrl('/home/'+url, {state: {loggedID: this.id}});
  }
  onTagClick(tag: string) {
    if (!this.newsService.list$) {
      this.newsService.list$ = this.reactiveService.getNewsSubject('main').value;
    }
    this.othersList$ = this.newsService.list$.filter(value1 => value1.topics.includes(tag));
    this.reactiveService.getNewsSubject('main').next(this.othersList$);
    this.newsService.activeLink = tag;
    this.newsService.callTag.next(tag);
  }
  onClick(url, newsOwnerId) {
    this.router.navigateByUrl(url, {state: {userID: '@' + newsOwnerId, loggedID: this.userService.loggedUser?this.userService.loggedUser.id:''}});
  }
  get newsCounts(): Map<string, string> {
    return this.newsService.newsCounts;
  }
  isDisabled(newsOwnerId: string){
    return this.userService.loggedUser && newsOwnerId === this.userService.loggedUser.id;
  }
}
