import { Observable, of, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    OnDestroy,
    NgZone,
    AfterViewInit, HostListener
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NewsService } from '../core/news.service';
import { AuthService } from '../core/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { UserService } from '../core/user.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FirebaseUserModel} from '../core/user.model';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { WindowRef } from '../core/window.service';
import { RecordSSE } from '../core/RecordSSE';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
    private readonly onDestroy = new Subject<void>();

    get orderBy(): string {
        return this._orderBy;
    }

    set orderBy(value: string) {
        this._orderBy = value;
    }

    get activeLink(): string {
        return this.newsService.activeLink;
    }

    set activeLink(value: string) {
        this.newsService.activeLink = value;
    }

    subscription_newslist: Subscription;
    newsCounts$: Map<string, string> = new Map<string, string>();
    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    user: FirebaseUserModel;
    _topTags: Observable<Array<RecordSSE>>;
    private _orderBy = 'count';
    public state$: Observable<{ [key: string]: string }>;
    listStyle = {};
    private newslistUrl = '/sse/chat/room/TopNews/subscribeMessages';
    private tagslistUrl = '/sse/chat/room/TopTags/subscribeMessages';


    constructor(
        private reactiveService: ReactiveStreamsService,
        public service: UserService,
        private route: ActivatedRoute,
        private router: Router,
        public location: Location,
        public authService: AuthService, private matIconRegistry: MatIconRegistry,
        public newsService: NewsService, private zone: NgZone, private domSanitizer: DomSanitizer,
        private changeDetectorRef: ChangeDetectorRef, private media: MediaMatcher,
        private winRef: WindowRef
    ) {

        // this.reactiveService.getNewsStream('top-news', this.newslistUrl);
        // this.reactiveService.getNewsStream('top-tags', this.tagslistUrl);

        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.matIconRegistry.addSvgIcon(
            'sentral',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/compass.svg')
        );
        //  this.ui.hide();
    }

    ngOnInit() {

        const myWis = this.winRef.nativeWindow.innerWidth;
        // if ('storage' in navigator && 'estimate' in navigator.storage) {
        //     navigator.storage.estimate()
        //         .then(function (estimate) {
        //             console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);
        //         });
        // }
        this.listStyle = {
            width: `${(myWis - 617) / 2}px`,
            paddingLeft: `${(myWis - 617) / 6}px`
        };
        if (!this.links.includes(this.activeLink)) { this.activeLink = this.links[0]; }

    }
    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        this.reactiveService.closeSources();
    }
    @HostListener('document:visibilitychange', ['$event'])
    visibilitychange() {
        this.checkHiddenDocument();
    }

    checkHiddenDocument() {
        if (document.hidden) {
            this.reactiveService.closeSources();
        }
    }

    get loggedUser(): FirebaseUserModel {
        return this.service.loggedUser;
    }

    get newsCounts(): Map<string, string> {
        return this.newsService.newsCounts;
    }

    set newsCounts(newCounts: Map<string, string>) {
        this.newsService.newsCounts = this.newsCounts$;
    }

    get newsCo(): Map<string, Array<string>> {
        return this.service.newsCo;
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
        if (this.subscription_newslist) { this.subscription_newslist.unsubscribe(); }
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    onClick(link: string) {
        if (link !== this.links[0] && this.service.newsCo.size === 0) {
            this.authService.redirectUrl = '/';
            this.router.navigateByUrl('/loginin');
            this.newsService.activeLink = link;
        } else if (link === this.links[2]) {
            this.newsService.setNewsList(this.newsCo.get(link), true);
            this.newsService.activeLink = link;
            this.orderBy = 'date';
        } else if (link === this.links[1]) {
            this.newsService.setNewsList(this.newsCo.get(link), false);
            this.newsService.activeLink = link;
            this.orderBy = 'count';
        } else {
            this.newsService.setNewsList(['main'], false);
            this.newsService.activeLink = link;
            this.orderBy = 'count';
        }
    }

    onTagClick(tag: string) {
        //  this.newsService.setNewsList([tag], false);
        this.newsService.newsList$ = this.newsService.newsStreamList$
            .pipe(map(value => value.filter(value1 => value1.topics.includes(tag))));

        this.newsService.activeLink = tag;
    }

    tagClick(_activeLink: string) {
        this.service.manageFollowingTag(_activeLink, true).pipe(takeUntil(this.onDestroy)).subscribe(value => {
            if (value) {
                this.service.dbUser.tags.push(_activeLink.substring(1));
                this.service.newsCo.get(this.links[1]).push(_activeLink);
            }
        });
        // const fet = ['tags'];
        // this.service.dbUser.tags.forEach(tag => fet.push(encodeURIComponent('#' + tag)));
        // fet.push(encodeURIComponent(_activeLink));
        // fet.push(encodeURIComponent('@' + this.service.dbUser.id));
        // this.subscription_newslist = this.service.setInterests(fet).pipe(takeUntil(this.onDestroy)).subscribe();

    }

    ngAfterViewInit(): void {
    }
}
