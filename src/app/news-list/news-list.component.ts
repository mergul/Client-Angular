import { Component, Input, OnInit, OnDestroy, NgZone, ViewChildren, ElementRef, QueryList, Renderer2, AfterViewInit } from '@angular/core';
import { NewsService } from '../core/news.service';
import { Observable, fromEvent, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { NewsPayload } from '../core/news.model';
import { Location } from '@angular/common';
import { map, takeUntil, debounceTime, distinctUntilChanged, switchMap, throttleTime } from 'rxjs/operators';
import { UserService } from '../core/user.service';
import { WindowRef } from '../core/window.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';

@Component({
    selector: 'app-news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, OnDestroy, AfterViewInit {
    public state = '';
    public thumbName;
    private newsBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    newsList$ = this.newsBehaviorSubject.asObservable();
    _orderBy = 'count';
    currentPage = 0;
    currentOffset = 0;
    isUp = false;
    newsListCounts = 0;
    private unsubscriber$: Subject<boolean> = new Subject<boolean>();
    destroy = new Subject();
    destroy$ = this.destroy.asObservable();
    private _currLink: string;
    prevOffset = 0;
    thumbHeight = 109;
    fontSize = 12;
    height = 109;
    private _newsList: Observable<NewsPayload[]>;
    subs: Subscription;
    list: NewsPayload[];
    othersList$: NewsPayload[];
    @ViewChildren("newsSum", { read: ElementRef }) newsSum: QueryList<ElementRef>;

    constructor(private zone: NgZone, private newsService: NewsService, public location: Location, private renderer: Renderer2,
        public userService: UserService, private reactiveService: ReactiveStreamsService, private winRef: WindowRef) {
    }
    ngAfterViewInit(): void {
        if (!this.newsService.isConnected && this.location.isCurrentPathEqualTo('/home') && this.activeLink === this.currLink) {
            const ind = this.newsService.links.indexOf(this.activeLink);
            this.winRef.nativeWindow.document.querySelectorAll('.news-list').forEach(item => {
                if (item.offsetLeft == ind * 617) item.classList.add('shadow');
                else item.classList.remove('shadow');
            })
            // this.winRef.nativeWindow.document.querySelectorAll('.news-list').forEach(item=>{
            //     if (item.offsetLeft == this.newsService.prevLink*617) item.classList.remove('shadow');
            // })
        }
        this.newsSum.changes.subscribe(comps => {
            // comps.forEach((item, index) => {
            //     this.renderer.addClass(item.nativeElement, 'shadow')
            // });
            this.newsService.preList.push(comps.toArray());
        });
    }

    ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
        this.unsubscriber$.unsubscribe();
    }
    @Input()
    get activeLink(): string {
        return this.newsService.activeLink;
    }
    @Input()
    get currLink(): string {
        return this._currLink;
    }

    set currLink(value: string) {
        this._currLink = value;
    }

    set activeLink(value: string) {
        if (value !== null && value && !this.newsService.activeLink) {
            this.newsService.activeLink = value;
        }
    }

    @Input()
    get newsList(): Observable<NewsPayload[]> {
        return this.newsList$;
    }

    set newsList(value: Observable<NewsPayload[]>) {
        if (value) {
            this._newsList = value;
            this.currentPage = 1;
            this.getStories();
        }
    }
    // checkSame = (a: NewsPayload[], b: NewsPayload[]) => {
    //    return a.every(val => b.some(ca => ca.newsId === val.newsId));
    // }
    getStories = () => {
        this._newsList.pipe(takeUntil(this.destroy$), map(x => {
            if (x.length > 5 && !this.unsubscriber$.closed) {
                if (this.currentPage > 1 && x.length < (this.currentPage * 5)) {
                    this.unsubscriber$.next(true);
                    this.unsubscriber$.unsubscribe();
                    this.currentPage = 1;
                    this.newsBehaviorSubject.next(x);
                    console.log('stopped to listen --> ' + this.prevOffset);
                } else { // if (!this.checkSame(x.slice(0, 5 * this.currentPage), this.newsBehaviorSubject.getValue()))
                    this.newsBehaviorSubject.next(x.slice(0, 5 * this.currentPage));
                    // if (this.unsubscriber$.observers.length === 0) {
                    //     this.subsToScroll();
                    // }
                }
            } else if (x.length > 0) { this.newsBehaviorSubject.next(x); }
            return this.newsList$;
        })).subscribe();
    }
    scrollObs = () => this.zone.runOutsideAngular(() => fromEvent(window.document.querySelector('.example-container'), 'scroll', {
        passive: true
    }).pipe(takeUntil(this.unsubscriber$), throttleTime(100), distinctUntilChanged()))

    getYPosition(): number {
        this.currentOffset = document.querySelector('.example-container').scrollTop;
        this.isUp = this.prevOffset > this.currentOffset;
        // console.log('is Up --> ' + this.isUp + ' ::prev-offset --> ' + this.prevOffset + ' ::page --> ' + this.currentPage
        // + ' ::curr-offset --> ' + this.currentOffset + ' ::Max-Height --> ' +
        // this.winRef.nativeWindow.document.documentElement.offsetHeight);
        return this.isUp ? 0 : this.currentOffset;
    }
    ngOnInit() {
        this.state = window.history.state ? window.history.state.userID : this.state;
        if (this.winRef.nativeWindow.innerWidth < 1080) {
            this.height = this.thumbHeight * (4 / 5);
            this.thumbHeight = this.height - 19;
            this.fontSize = 9;
        } else {
            this.thumbHeight = this.thumbHeight - 19;
        }
        if (this.location.isCurrentPathEqualTo('/home') && this.newsService.callToggle.observers.length < 2) {
            if (this.currLink === this.activeLink) {
                this.newsService.callToggle.subscribe((data) => {
                    const index = this.newsService.links.indexOf(this.newsService.activeLink);
                    this.newsService.preList.forEach((items, ind) => {
                        if (ind === index) {
                            if (items[0].nativeElement.isConnected) {
                                items.forEach(item =>
                                    this.renderer.addClass(item.nativeElement, 'shadow')
                                );
                            } else {
                                this.winRef.nativeWindow.document.querySelectorAll('.news-list').forEach(item => {
                                    if (item.offsetLeft == ind * 617) item.classList.add('shadow')
                                })
                            }
                        } else {
                            if (items[0].nativeElement.isConnected) {
                                items.forEach(item =>
                                    this.renderer.removeClass(item.nativeElement, 'shadow')
                                );
                            } else {
                                this.winRef.nativeWindow.document.querySelectorAll('.news-list').forEach(item => {
                                    if (item.offsetLeft == ind * 617) item.classList.remove('shadow')
                                })
                            }
                        }  
                    });
                });
            }
        };
        this.subs = this.subsToScroll();
    }
    subsToScroll() {
        return this.scrollObs().subscribe((e: Event) => {
            if (this.activeLink === this.currLink) {
                if (this.getYPosition() > (((document.querySelector('.example-container') as HTMLElement).offsetHeight - 100)
                    * (this.currentPage - 1))) {
                    this.currentPage++;
                    this.prevOffset = this.currentOffset;
                    this.getStories();
                }
            }
        });
    }
    get newsCounts(): Map<string, string> {
        return this.newsService.newsCounts;
    }

    onTagClick(tag: string) {
        if (!this.newsService.list$) {
            this.newsService.list$ = this.reactiveService.getNewsSubject('main').value;
        }
        this.othersList$ = this.newsService.list$.filter(value1 => value1.topics.includes(tag));
        this.reactiveService.getNewsSubject('main').next(this.othersList$);

        // this.newsService.newsList$ = this.newsService.newsStreamList$
        //     .pipe(takeUntil(this.destroy$), map(value => value.filter(value1 => value1.topics.includes(tag)))
        //     , map(dfs => {
        //         this.newsBehaviorSubject.next(dfs);
        //         return dfs;
        //     }));

        this.newsService.activeLink = tag;
    }
    byId(index, item: NewsPayload) {
        if (!item) {
            return null;
        }
        return item.newsId;
    }
}
