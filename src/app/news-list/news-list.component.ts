import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NewsService } from '../core/news.service';
import { Observable, fromEvent, Subject, of } from 'rxjs';
import { NewsPayload } from '../core/news.model';
import { Location } from '@angular/common';
import { map, takeUntil, debounceTime } from 'rxjs/operators';
import { UserService } from '../core/user.service';

@Component({
    selector: 'app-news-list',
    //  changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, OnDestroy {
    public state = '';
    public thumbName;
    newsList$: Observable<NewsPayload[]>;
    _orderBy = 'count';
    currentPage = 0;
    newsPayCounts = 4;

    destroy = new Subject();
    destroy$ = this.destroy.asObservable();
    private _currLink: string;

    constructor(private zone: NgZone, private newsService: NewsService, public location: Location, public userService: UserService) {
    }

    ngOnDestroy(): void {
        this.destroy.next();
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
            this.newsList$ = value;
            this.currentPage = 1;
            this.getStories();
        } else {
            this.newsList$ = of([]);
        }
    }
    getStories = () => {
        this.newsList$ = this.newsList$.pipe(map(x => x.slice(0, 4 * this.currentPage)));
    }
    scrollObs = () => this.zone.runOutsideAngular(() => fromEvent(window, 'scroll').pipe(takeUntil(this.destroy$), debounceTime(100)));

    getYPosition(): number {
        return document.documentElement.scrollTop;
    }
    ngOnInit() {
        this.state = window.history.state ? window.history.state.userID : this.state;
        this.scrollObs().subscribe((e: Event) => {
            if (this.activeLink === this.currLink || this.currLink === 'me') {
                if (this.getYPosition() > 80 + ((document.documentElement.offsetHeight - 80) * (this.currentPage - 1))) {
                    this.currentPage++;
                    this.getStories();
                }
            }
        });
    }
    get newsCounts(): Map<string, string> {
        return this.newsService.newsCounts;
    }

    onTagClick(tag: string) {
        this.newsList$ = this.newsService.newsList$ = this.newsService.newsStreamList$
            .pipe(map(value => value.filter(value1 => value1.topics.includes(tag))));

        this.newsService.activeLink = tag;
    }

    getName(file_name: string) {
        if (!file_name) { file_name = 'bae.jpg'; }
        const ja = file_name.lastIndexOf('.');
        return 'thumb-kapak-' + file_name.slice(0, ja) + '.jpeg';
    }
}
