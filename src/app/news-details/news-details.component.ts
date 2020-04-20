import {
    Component,
    Input,
    OnInit,
    AfterViewInit,
    OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { Router} from '@angular/router';
import { Observable, of, Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { News, Review } from '../core/news.model';
import { NewsService } from '../core/news.service';
import { WindowRef } from '../core/window.service';
import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { UserService } from '../core/user.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-listing-dialog',
    templateUrl: 'news-details.components.html',
    styleUrls: ['./news-details.component.scss']
})
export class NewsDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    public tagList: Array<string>;
    private readonly onDestroy = new Subject<void>();
    storagepath = 'https://storage.googleapis.com/sentral-news-media/';
    showModal: Observable<boolean> = of(false);

    @Input() news$: News;
    listenerFn: () => void;
    count: Observable<string>;
    public state = '';
    private player: AnimationPlayer;
    private playerS: AnimationPlayer;
    private itemWidth = 1000;
    private currentSlide = 0;
    @ViewChild('carousel', { read: ElementRef, static: false }) carousel;
    @ViewChild('slider', { read: ElementRef, static: false }) slider;
    @Input() timing = '250ms ease-in';
    carouselWrapperStyle = {};
    carouselWrapStyle = {};
    carouselPagerStyle: {};
    private _social = of(false);

    constructor(private router: Router, private service: NewsService,
        private userService: UserService, private winRef: WindowRef
        , private builder: AnimationBuilder, public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.state = window.history.state ? window.history.state.userID : this.state;
        this.itemWidth = this.winRef.nativeWindow.innerWidth - 50;
        if (this.itemWidth > 788) { this.itemWidth = 788; }
        this.carouselWrapperStyle = {
            width: `${this.itemWidth}px`
        };
            this.service.newsPayload = {
                'newsId': this.news$.id, 'newsOwnerId': this.news$.ownerId, 'newsOwner': this.news$.owner, 'tags': [], topics: []
                , 'clean': this.news$.clean, 'topic': this.news$.topic
                , 'thumb': this.news$.mediaReviews[0].file_name, 'count': 1, 'date': this.news$.date
            };
            this.count = of(this.newsCounts.get(this.news$.id));
            this.carouselWrapStyle = {
                width: `${this.itemWidth * this.news$.mediaReviews.length}px`
            };
            this.carouselPagerStyle = {
                width: `${190 * this.news$.mediaReviews.length}px`
            };
    }

    ngAfterViewInit() {
        this.showModal = of(true);
    }

    get newsCounts(): Map<string, string> {
        return this.service.newsCounts;
    }
    get social(): Observable<boolean> {
        return this._social;
    }

    set social(value: Observable<boolean>) {
        this._social = value;
    }
    onClose(redir: string) {
        this.activeModal.close(redir);
    }

    onDialogClick(event: UIEvent) {
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    next() {
        if (this.currentSlide + 1 === this.news$.mediaReviews.length) {
            return;
        }
        this.currentSlide = (this.currentSlide + 1) % this.news$.mediaReviews.length;
        const offset = this.currentSlide * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
        if (this.currentSlide % 4 === 0) {
            const mySoffset = 4 * 190;
            const mySAnimation: AnimationFactory = this.buildAnimation(mySoffset);
            this.playerS = mySAnimation.create(this.slider.nativeElement);
            this.playerS.play();
        }
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

        if (this.currentSlide % 4 === 3) {
            const mySoffset = ((this.currentSlide - 3) / 4) * 190;
            const mySAnimation: AnimationFactory = this.buildAnimation(mySoffset);
            this.playerS = mySAnimation.create(this.slider.nativeElement);
            this.playerS.play();
        }
    }

    currentDiv(n: number) {
        this.currentSlide = n;
        const offset = n * this.itemWidth;
        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
    }
    trustIt(yh: string): string[] {
        this.tagList = yh.match(/.[^#]*/gi);
        return this.tagList;
    }

    setSocial() {
        this._social.pipe(takeUntil(this.onDestroy)).subscribe(value => {
            if (value) {
                this.social = of(false);
            } else {
                this.social = of(true);
            }
        });
    }

    getReview(review: Review) {
        return new Review(this.storagepath + review.file_name, '', '', review.file_type);
    }
    getName(file_name: string, i: number) {
        const na = i === 0 ? 'thumb-kapak-' : i === -1 ? 'medium-' : 'thumb-';
        const ja = file_name.lastIndexOf('.');
        return na + file_name.slice(0, ja) + '.jpeg';
    }
    isManager() {
        return this.userService.dbUser && (this.userService.dbUser.roles.includes('ROLE_ADMIN')
            || this.userService.dbUser.roles.includes('ROLE_MODERATOR'));
    }

    onTagClick(tag: string) {
        this.service.setNewsList([tag], false);
        this.service.activeLink = tag;
        this.router.navigate(['/']);
    }
}
