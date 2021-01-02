import { Observable, Subject, Subscription, fromEvent } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ViewChild, ElementRef, Input } from '@angular/core';
import { Location } from '@angular/common';
import { NewsService } from '../core/news.service';
import { UserService } from '../core/user.service';
import { FirebaseUserModel } from '../core/user.model';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { WindowRef } from '../core/window.service';
import { RecordSSE } from '../core/RecordSSE';
import { HammerGestureConfig } from '@angular/platform-browser';
import { AnimationPlayer, AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';
import { Router } from '@angular/router';
import { NewsPayload } from '../core/news.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
    private destroy = new Subject();
    destroy$ = this.destroy.asObservable();
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
    // subscription_newslist: Subscription;
    newsCounts$: Map<string, string> = new Map<string, string>();
    mobileQuery: MediaQueryList;
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    user: FirebaseUserModel;
    _topTags: Observable<Array<RecordSSE>>;
    private _orderBy = 'count';
    public state$: Observable<{ [key: string]: string }>;
    leftListStyle = {};
    rightListStyle = {};
    carouselStyle = {};
    miCarouselStyle = {};
    alive = true;
    _activeLink: string;
    navSlide = 0;
    hght: number;
   // newsList$: NewsPayload[];
    othersList$: NewsPayload[];


    constructor(
        private reactiveService: ReactiveStreamsService,
        public service: UserService, private builder: AnimationBuilder,
        public location: Location, private router: Router,
        public newsService: NewsService,
        private winRef: WindowRef, private renderer: Renderer2
    ) {
        if (this.newsService.callToggle.observers.length === 0) {
            this.newsService.callToggle.subscribe((data) => {
            //    if (data <= 0) {
                    console.log('move to --> '+data+' :: currentSlide --> '+this.currentSlide+' :: active --> '+this.newsService.activeLink);
                    this.navSlide = data;
                    const index=this.links.indexOf(this.newsService.activeLink);
                    this.currentSlide = index===-1||this.links[this.currentSlide] === this.newsService.activeLink?this.currentSlide:index;
                    console.log('move to --> '+data+' :: currentSlide --> '+this.currentSlide+' :: active --> '+this.newsService.activeLink);
                    this.onNavClick(this.loggedUser?this.newsService.activeLink:this.links[-data], index===-1?this.navSlide:index);
                    // setTimeout(() => {
                    //     winRef.nativeWindow.location.reload();
                    // }, 55);
            //    }
                //  else {
                //     this.navSlide = data;
                //     this.currentSlide = data;
                //     this.onNavClick(this.newsService.activeLink);
                // }
            });
        }
    }

    ngOnInit() {
        this.hght = this.winRef.nativeWindow.innerHeight * 2;
        const myWis = this.winRef.nativeWindow.innerWidth;
        if (myWis < 617) {
            this.itemWidth = myWis;
        }
        this.leftListStyle = {
            width: `${(myWis - this.itemWidth) / 2}px`,
            paddingLeft: myWis < 917 ? `0px` : `${(myWis - this.itemWidth) / 6}px`,
            display: myWis < 817 ? 'none' : 'inline-block'
        };
        this.rightListStyle = {
            width: `${(myWis - this.itemWidth) / 2}px`,
            paddingRight: myWis < 917 ? `0px` : `${(myWis - this.itemWidth) / 6}px`,
            display: myWis < 817 ? 'none' : 'inline-block'
        };
        this.miCarouselStyle = {
            width: `${this.itemWidth}px`
        };
        this.carouselStyle = {
            minWidth: `${this.itemWidth}px`,
            marginLeft: myWis < 817 && myWis > 617 ? `${(myWis - this.itemWidth) / 2}px` : `0px`
        };
        this.carouselWrapStyle = {
            width: `${this.itemWidth * this.links.length}px`
        };
        if (!this.activeLink || (!this.links.includes(this.activeLink) && !this.activeLink.startsWith('#'))) {
            this.activeLink = this.links[0];
        }
        const hammerConfig = new HammerGestureConfig();
        const hammer = hammerConfig.buildHammer(this.listContainer.nativeElement);
        fromEvent(hammer, 'swipe').pipe(
            takeWhile(() => this.alive))
            .subscribe((res: any) => {
                if (this.loggedUser) {
                    res.deltaX > 0 ? this.prev() : this.next();
                } else if (res.deltaX < 0) {
                    this.service.redirectUrl = '/home';
                    this.newsService.activeLink = this.links[1];
                    this.router.navigate(['/loginin']);
                }
            });
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
        // if (this.subscription_newslist) { this.subscription_newslist.unsubscribe(); }
        // if (this.player) {
        //     this.player.finish();
        // }
        this.destroy.next();
        this.destroy.complete();
    }

    onNavClick(link: string, index=0) {
        if (index===-1&&this.currentSlide===0) {
            this.reactiveService.getNewsSubject('main').next(this.newsService.list$);
            this.newsService.activeLink=this.links[this.currentSlide];
        }
        else if (link === this.links[0] || this.service.loggedUser) {
            let milink = this.links.indexOf(this.newsService.activeLink);
            this.newsService.activeLink = link;
            if (milink === -1) {
                this.reactiveService.getNewsSubject('main').next(this.newsService.list$);
                milink += 1;
            }
            this.slideIn(this.navSlide !== 0 ? this.navSlide : milink - this.links.indexOf(link));
        } else {
            this.service.redirectUrl = '/home';
            this.newsService.activeLink = link;
           if(index!==0) this.reactiveService.getNewsSubject('main').next(this.newsService.list$);
            this.router.navigate(['/loginin']);
        }
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
        const ind = this.links.indexOf(this.activeLink);
        if (ind > -1) { this.slideIn(ind); }
        if (!this.newsService.list$) {
            this.newsService.list$ = this.reactiveService.getNewsSubject('main').value;
        }
        this.othersList$ = this.newsService.list$.filter(value1 => value1.topics.includes(tag));
        this.reactiveService.getNewsSubject('main').next(this.othersList$);
        this.newsService.activeLink = tag;
        this.newsService.callTag.next(tag);
    }

    registerToTag(_activeLink: string) {
        if (this.service.dbUser) {
            this.service.manageFollowingTag(_activeLink, true).pipe(takeUntil(this.destroy$)).subscribe(value => {
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
        if (this.activeLink !== this.links[0] && this.loggedUser) {
            if (this.activeLink === this.links[1]) {
                this.next();
            } else if (this.activeLink === this.links[2]) {
                this.next(); this.next();
            }
        } else {
            if (this.activeLink === this.links[1]) {
                this.onNavClick(this.activeLink);
            } else if (this.activeLink === this.links[2]) {
                this.onNavClick(this.activeLink);
                this.onNavClick(this.activeLink);
            } else if (!this.loggedUser) this.newsService.callTag.next(this.activeLink)
        }
    }
    next() {
        if (this.currentSlide + 1 === this.links.length) {
            return;
        }
        this.currentSlide = (this.currentSlide + 1) % this.links.length;
        const offset = this.currentSlide * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement.isConnected ? this.carousel.nativeElement : this.winRef.nativeWindow.document.querySelector('.carousel-inner'));
        this.player.onDone(() => {
           console.log('player is done next animation --> '+this.player.totalTime);
           this.newsService.endPlayer.next(true);
        });
        this.player.play();
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
        this.player = myAnimation.create(this.carousel.nativeElement.isConnected ? this.carousel.nativeElement : this.winRef.nativeWindow.document.querySelector('.carousel-inner'));
        this.player.onDone(() => {
            console.log('player is done prev animation --> '+this.player.totalTime);
            this.newsService.endPlayer.next(true);
         });
        this.player.play();
        this.newsService.activeLink = this.links[this.currentSlide];
    }
    currentDiv(n: number) {
        this.currentSlide = n;
        const offset = n * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
    }
}
