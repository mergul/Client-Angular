import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NewsService } from '../core/news.service';
import { UserService } from '../core/user.service';
import { NewsPayload } from '../core/news.model';
import { map, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { WindowRef } from '../core/window.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ReactiveStreamsService } from '../core/reactive-streams.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['../news-list/news-list.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  deletedNews: string[] = [];
  private _orderBy = 'count';
  links: string[] = ['Ençok Şikayet', 'Müstehcen', 'Şiddet'];
  adListStyle = {};
  searchField: FormControl;
  searchForm: FormGroup;
  tagList: Array<string> = new Array<string>();
  newsList$: Observable<NewsPayload[]>;
  public state = '';
  tagsList: Array<string> = new Array<string>();

  constructor(public service: UserService, private router: Router, public location: Location,
    private reactiveService: ReactiveStreamsService, private newsService: NewsService,
    private winRef: WindowRef,
    private fb: FormBuilder) {
    if (!this.service.reStreamList$) {
      this.reactiveService.getReportsStream('top-newsr', '/reported/chat/room/TopNewsR/subscribeMessages');
    }
  }
  @Input()
  get orderBy(): string {
    return this._orderBy;
  }

  set orderBy(value: string) {
    this._orderBy = value;
  }
  ngOnInit() {
    const myWis = this.winRef.nativeWindow.innerWidth;

    this.adListStyle = {
      width: `${(myWis - 617) / 2}px`,
      paddingLeft: `${(myWis - 617) / 8}px`
    };
    this.state = window.history.state ? window.history.state.userID : this.state;
    this.activeLink = this.links[0];
    this.searchForm = this.fb.group({});
    this.searchField = new FormControl();
    if (!this.service.reStreamList$) {
      this.newsList$ = this.service.reStreamList$ = this.reactiveService.getMessage(this.links[0]);
    } else { this.newsList$ = this.service.reStreamList$; }
    if (!this.service.reStreamCounts$) {
      this.service.reStreamCounts$ = this.reactiveService.getMessage('user-countsr')
        .pipe(map(record => {
          this.newsService.reportedNewsCounts$.set(record.key, String(record.value));
          return record;
        }));
    }
  }
  getTopTagsRecordsList(etiket: string): Observable<Array<NewsPayload>> {
    return this.newsService.getTopNewsList(etiket);
  }

  get newsCounts(): Map<string, string> {
    return this.newsService.reportedNewsCounts;
  }

  onTagClick(tag: string) {
   // this.newsList = this.service.reStreamList$
   //   .pipe(map(value => value.filter(value1 => value1.topics.includes(tag))));
   this.newsList = this.reactiveService.getMessage(tag);
   this.newsService.activeLink = tag; 
  }

  @Input()
  get activeLink(): string {
    return this.newsService.activeLink;
  }

  set activeLink(value: string) {
    this.newsService.activeLink = value;
  }

  @Input()
  get newsList(): Observable<NewsPayload[]> {
    return this.newsList$;
  }

  set newsList(value: Observable<NewsPayload[]>) {
    this.newsList$ = value;
  }

  onUserClick(news: NewsPayload) {
    // this.newsList = this.service.reStreamList$
    //   .pipe(map(value => value.filter(value1 => value1.newsOwnerId === news.newsOwnerId)));
    this.reactiveService.setOtherListener('@' + news.newsOwnerId, true);
    this.newsService.setRepoUser('@' + news.newsOwnerId).pipe(takeUntil(this.onDestroy)).subscribe();
    this.newsList$ = this.reactiveService.getMessage('repo-person');
    this.newsService.activeLink = '@' + news.newsOwner;
  }

  ngOnDestroy(): void {
    this.activeLink = this.newsService.mlink;
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  deleteNews(id: string) {
    this.newsService.deleteNewsById(id).pipe(takeUntil(this.onDestroy)).subscribe(() => {
      this.deletedNews.push(id);
      this.newsList = this.getTopTagsRecordsList('main');
    });
  }

  onClick(link: string) {
    // this.newsList = this.getTopTagsRecordsList(link === this.links[0] ? 'main' : '#' + link);
 //   const tab = link === this.links[0] ? 'main' : '#' + link;
    this.newsService.activeLink = link;
    this.newsList$ = this.reactiveService.getMessage(link);
   // if (tab !== 'main') {
   //   this.newsList$ = this.service.reStreamList$
   //     .pipe(map(value => value.filter(value1 => value1.topics.includes(tab))));
   // } else { this.newsList$ = this.service.reStreamList$; }
  }

  clearNews(id: string, ownerId: string) {
    this.newsService.newsPayload = { 'newsId': id, 'newsOwner': ownerId, 'tags': [], 'clean': true };
    return this.newsService.clearNews(id).pipe(takeUntil(this.onDestroy)).subscribe(() => {
      this.onClick(this.links[0]);
    });
  }
  profileClick() {
    this.router.navigate(['/allusers', this.activeLink.substring(1)]);
  }

  getName(file_name: string) {
    const ja = file_name.lastIndexOf('.');
    return 'thumb-kapak-' + file_name.slice(0, ja) + '.jpeg';
  }

}
