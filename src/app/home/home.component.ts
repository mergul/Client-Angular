import { Observable, Subject, Subscription, fromEvent, of } from 'rxjs';
import { map, takeUntil, takeWhile } from 'rxjs/operators';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    OnDestroy,
    AfterViewInit, HostListener, Renderer2, ViewChild, ElementRef, Input
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NewsService } from '../core/news.service';
import { AuthService } from '../core/auth.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { UserService } from '../core/user.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FirebaseUserModel } from '../core/user.model';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { WindowRef } from '../core/window.service';
import { RecordSSE } from '../core/RecordSSE';
import { HammerGestureConfig } from '@angular/platform-browser';
import { AnimationPlayer, AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
    private readonly onDestroy = new Subject<void>();
    twttr: any;
    @ViewChild('listContainer', { static: true }) listContainer: ElementRef;
    private player: AnimationPlayer;
    private itemWidth = 617;
    private currentSlide = 0;
    @ViewChild('carousel', { read: ElementRef, static: false }) carousel;
    @Input() timing = '250ms ease-in';
    carouselWrapperStyle = {};
    carouselWrapStyle = {};
    carouselPagerStyle: {};
    subscription_newslist: Subscription;
    newsCounts$: Map<string, string> = new Map<string, string>();
    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    user: FirebaseUserModel;
    _topTags: Observable<Array<RecordSSE>>;
    private _orderBy = 'count';
    public state$: Observable<{ [key: string]: string }>;
    llistStyle = {};
    rlistStyle = {};
    carouselStyle = {};
    miCarouselStyle = {};
    alive = true;
    _activeLink: string;

    constructor(
        private reactiveService: ReactiveStreamsService,
        public service: UserService, private builder: AnimationBuilder,
        private router: Router, public location: Location,
        public authService: AuthService, private matIconRegistry: MatIconRegistry,
        public newsService: NewsService, private domSanitizer: DomSanitizer,
        changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
        private winRef: WindowRef, private renderer: Renderer2
    ) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.matIconRegistry.addSvgIcon(
            'sentral',
            this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/compass.svg')
        );
    }

    ngOnInit() {
        const myWis = this.winRef.nativeWindow.innerWidth;
        if (myWis < 617) {
            this.itemWidth = myWis;
        }
        this.llistStyle = {
            width: `${(myWis - this.itemWidth) / 2}px`,
            paddingLeft: `${(myWis - this.itemWidth) / 6}px`
        };
        this.rlistStyle = {
            width: `${(myWis - this.itemWidth) / 2}px`,
            paddingRight: `${(myWis - this.itemWidth) / 6}px`
        };
        this.miCarouselStyle = {
            width: `${this.itemWidth}px`,
        };
        this.carouselStyle = {
            minWidth: `${this.itemWidth}px`,
        };
        this.carouselWrapStyle = {
            width: `${this.itemWidth * this.links.length}px`,
        };
        if (!this.activeLink || (!this.links.includes(this.activeLink) && !this.activeLink.startsWith('#'))) {
            this.activeLink = this.links[0];
        }
        const hammerConfig = new HammerGestureConfig();
        const hammer = hammerConfig.buildHammer(this.listContainer.nativeElement);
        fromEvent(hammer, 'swipe').pipe(
            takeWhile(() => this.alive))
            .subscribe((res: any) => {
                console.log(res.deltaX < 0 ? 'to the left => ' + res.deltaX : 'to the rigth => ' + res.deltaX);
                res.deltaX > 0 ? this.prev() : this.next();
            });
    }
    @HostListener('window:beforeunload', ['$event'])
    doSomething() {
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

    onNavClick(link: string) {
        let milink = this.links.indexOf(this.newsService.activeLink);
        this.newsService.activeLink = link;
        if (milink === -1) {
            this.newsService.newsList = this.newsService.newsStreamList$;
            milink += 1;
        }
        this.slideIn(milink - this.links.indexOf(link));
    }
    slideIn = (diff) => {
        while (diff !== 0) {
            if (diff < 0) {
                this.next();
                diff++;
            } else {
                this.prev();
                diff--;
            }
        }
    }
    onTagClick(tag: string) {
        this.slideIn(this.links.indexOf(this.activeLink));
        this.newsService.newsList = this.newsService.newsStreamList$
            .pipe(map(value => value.filter(value1 => value1.topics.includes(tag))));

        this.newsService.activeLink = tag;
    }

    registerToTag(_activeLink: string) {
        if (this.service.dbUser) {
            this.service.manageFollowingTag(_activeLink, true).pipe(takeUntil(this.onDestroy)).subscribe(value => {
                if (value) {
                    this.service.dbUser.tags.push(_activeLink.substring(1));
                    this.service.newsCo.get(this.links[1]).push(_activeLink);
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this.renderer.listen(this.winRef.nativeWindow, 'dragstart', (event) => {
            event.preventDefault();
        });
        if (this.activeLink === this.links[1]) {
            this.next();
        } else if (this.activeLink === this.links[2]) {
            this.next(); this.next();
        }
    }
    next() {
        if (this.currentSlide + 1 === this.links.length) {
            return;
        }
        this.currentSlide = (this.currentSlide + 1) % this.links.length;
        const offset = this.currentSlide * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
        // this.onClick(this.links[this.currentSlide]);
        this.newsService.activeLink = this.links[this.currentSlide];
    }

    private buildAnimation(offset) {
        return this.builder.build([
            animate(this.timing, style({ transform: `translateX(-${offset}px)` }))
        ]);
    }

    prev() {
        if (this.currentSlide === 0) {
            return;
        }

        this.currentSlide = this.currentSlide - 1;
        const offset = this.currentSlide * this.itemWidth;

        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
        // this.onClick(this.links[this.currentSlide]);
        this.newsService.activeLink = this.links[this.currentSlide];
    }
    currentDiv(n: number) {
        this.currentSlide = n;
        const offset = n * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
    }
    emptyObs() {
        of([]);
        // if (link !== this.links[0] && this.service.newsCo.size === 0) {
        //     this.authService.redirectUrl = '/';
        //     this.router.navigateByUrl('/loginin');
        // } else if (link === this.links[2]) {
        //     this.newsService.setNewsList(this.newsCo.get(link), true);
        //     this.orderBy = 'date';
        // } else if (link === this.links[1]) {
        //     this.newsService.setNewsList(this.newsCo.get(link), false);
        //     this.orderBy = 'count';
        // } else {
        //     this.newsService.setNewsList(['main'], false);
        //     this.orderBy = 'count';
        // }
    }
}
