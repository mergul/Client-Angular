import {Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, Inject, HostListener} from '@angular/core';
import { Observable, of, Subject, from, fromEvent } from 'rxjs';
import { takeUntil, map, takeWhile } from 'rxjs/operators';
import { News, Review } from '../core/news.model';
import { NewsService } from '../core/news.service';
import { WindowRef } from '../core/window.service';
import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';
import { UserService } from '../core/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SpeechService, RecognitionResult } from '../core/speech-service';
import {HammerGestureConfig} from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';

@Component({
    selector: 'app-details',
    templateUrl: 'news-details.components.html',
    styleUrls: ['./news-details.component.scss']
})
export class NewsDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    public tagList: Array<string>;
    private readonly onDestroy = new Subject<void>();
    storagepath = 'https://storage.googleapis.com/sentral-news-media/';
    @ViewChild('publicChatBox', {static: true}) publicChatBox: ElementRef;
    @ViewChild('textBox', {static: true}) textBox: ElementRef;
    @ViewChild('speechTextBox', {static: true}) speechTextBox: ElementRef;
    @ViewChild('startButton', {static: true}) startButton: ElementRef;

    color: string;
    news$: News;
    listenerFn: () => void;
    count: Observable<string>;
    // public state = '';
    private player: AnimationPlayer;
    private playerS: AnimationPlayer;
    itemWidth = 788;
    private currentSlide = 0;
    @ViewChild('carousel', { read: ElementRef, static: false }) carousel;
    @ViewChild('slider', { read: ElementRef, static: false }) slider;
    @ViewChild('carouselWrapper', {static: true}) carouselWrapper: ElementRef;
    @Input() timing = '250ms ease-in';
    carouselWrapperStyle = {};
    carouselWrapStyle = {};
    carouselPagerStyle: {};
    sliderWrapperStyle: {};
    wideStyle: {};
    private _social = of(false);
    twttr: any;
    mySrc: Observable<string>;
    speechMessages: Observable<RecognitionResult>;
    languages: string[] = ['tr', 'en', 'es', 'de', 'fr'];
    currentLanguage = 'tr';
    finalTranscript: string;
    targetLanguage = 'fr';
    foods: Observable<MediaDeviceInfo[]>;
    startButtonDisabled: boolean;
    recognizing = false;
    localStream: MediaStream;
    private constraints = {
        video: false,
        audio: true
    };
    mitext = '';
    alive = true;
    height: number;
    thumbWidth = 174;
    thumbHeight = 109;
    isManager = false;
    loggedID: string;

    constructor(public dialogRef: MatDialogRef<NewsDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
     private service: NewsService, private speechService: SpeechService,
        private userService: UserService, private winRef: WindowRef, protected sanitizer: DomSanitizer
        , private builder: AnimationBuilder, private _snackBar: MatSnackBar,
         private renderer: Renderer2, @Inject(DOCUMENT) private _document: Document) {
             this.news$ = data.news$;
             this.color = data.color;
    }
    @HostListener('window:keyup.esc') onKeyUp() {
        this.onClose('');
    }
    ngOnInit() {
        this.loggedID = window.history.state ? window.history.state.loggedID : this.loggedID;
        this.itemWidth = this.winRef.nativeWindow.innerWidth - 40;
        if (this.itemWidth < 1040) {
            this.thumbWidth = this.thumbWidth * (4 / 5) + 10;
            this.thumbHeight = this.thumbHeight * (4 / 5) + 20;
        } else {
            this.thumbWidth = this.thumbWidth + 10;
            this.thumbHeight = this.thumbHeight + 20;
        }
        if (this.itemWidth > 788) { this.itemWidth = 788; }
        this.height = 580 * (this.itemWidth / 788);
        this.carouselWrapperStyle = {
            width: `${this.itemWidth}px`,
            height: `${500 * (this.itemWidth / 788)}px`
        };
        const modalWidth = this.data.header$;
        this.wideStyle = {
            width: `${modalWidth}px`
        };
        this.sliderWrapperStyle = {
            minHeight: `${this.height}px`
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
            width: `${(this.thumbWidth + 10) * this.news$.mediaReviews.length}px`
        };
        this.isManager = this.userService.dbUser && (this.userService.dbUser.roles.includes('ROLE_ADMIN')
        || this.userService.dbUser.roles.includes('ROLE_MODERATOR'));
        this.speechService.init();
        if (this.speechService._supportRecognition) {
            this.speechService.initializeSettings(this.currentLanguage);
            this.speechMessages = this.speechService.getMessage().pipe(map((text) => {
                this.finalTranscript = text.transcript;
                if (text.transcript && text.info === 'final_transcript') {
                    this.handleSentence(this.finalTranscript);
                } else if (text.transcript && text.info === 'print') {
                    this.handleSendButton(text.transcript);
                }
                return text;
            }));
        } else {
            this.startButtonDisabled = true;
        }
    }

    ngAfterViewInit() {
     //   setTimeout(() => {
            this.renderer.setStyle(this._document.querySelector('.mat-dialog-container'), 'background-color', this.color);
      //  });
        this.renderer.setProperty(this._document.getElementById('mihtml'), 'innerHTML', this.news$.summary);
        const hammerConfig = new HammerGestureConfig();
        const hammer = hammerConfig.buildHammer(this.carousel.nativeElement);
        fromEvent(hammer, 'swipe').pipe(
          takeWhile(() => this.alive))
          .subscribe((res: any) => {
            console.log(res.deltaX < 0 ? 'to the left => ' + res.deltaX : 'to the rigth => ' + res.deltaX);
            res.deltaX > 0 ? this.prev() : this.next();
        });
        if (!this.speechService._supportRecognition) {
            this._snackBar.open('Your Browser has no support for Speech!', 'Try Chrome for Speech!', {
                duration: 3000,
              });
        }
    }
    gotDevices(mediaDevices: MediaDeviceInfo[]) {
        return mediaDevices.filter(value => value.kind === 'videoinput');
    }
    startCamera() {
        if (this.startButton.nativeElement.innerHTML.startsWith('Start')) {
            if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
               // this.startButtonDisabled = true;
                this.foods = from(navigator.mediaDevices.enumerateDevices()
                    .then(this.gotDevices));
                navigator.mediaDevices.getUserMedia(this.constraints)
                    .then(this.attachVideo.bind(this))
                    .catch(this.handleError);
            } else {
                alert('Sorry, camera not available.');
            }
        } else {
            this.speechService.stop();
            this.renderer.setProperty(this.startButton.nativeElement, 'innerHTML', 'Start Microphone');
            this.renderer.addClass(this.startButton.nativeElement, 'button-outline');
            this.micStop(this.localStream);
        }
    }
    onSelectLanguage(language: string) {
        this.currentLanguage = language;
        this.speechService.setLanguage(this.currentLanguage);
    }
    attachVideo(stream) {
        this.localStream = stream;
        if (this.speechService._supportRecognition) {
            if (this.recognizing) {
                this.speechService.stop();
                return;
            }
            this.speechService.startSpeech(stream.startTime);
            this.renderer.setProperty(this.startButton.nativeElement, 'innerHTML', 'Stop Microphone');
            this.renderer.removeClass(this.startButton.nativeElement, 'button-outline');
        }
    }
    handleError(error) {
        console.log('Error: ', error);
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
        this.micStop(this.localStream);
      //  this.renderer.setStyle(this._document.querySelector('.mat-dialog-container'), 'background-color', 'transparent');
      this.dialogRef.close(redir);
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

    onTagClick(tag: string) {
        this.service.newsList$ = this.service.newsStreamList$
        .pipe(map(value => value.filter(value1 => value1.topics.includes(tag))));

        this.service.activeLink = tag;
        this.onClose('/home');
    }
    handleKey = (evt) => {
        if (evt.keyCode === 13 || evt.keyCode === 14) {
                this.handleSendButton(this.textBox.nativeElement.value);
        }
    }
    handleSentence = (text) => {
          this.mitext += text;
          this.speechService.mitext = this.mitext;
    }
    handleSendButton = (text) => {
        const time = new Date();
        const timeStr = time.toLocaleTimeString();
        const mit = '<div style="background: #e1ffc7; margin-bottom: 10px; padding: 10px">' + '<strong>' + this.userService.dbUser.email
        + '</strong> <br>' + text + '<span>' + '<span style="padding: 10px; float: right;">' + timeStr +
        '</span>' + '</span></div>';
        this.renderer.setProperty(this.publicChatBox.nativeElement, 'innerHTML', this.publicChatBox.nativeElement.innerHTML + mit);
        this.publicChatBox.nativeElement.scrollTop = this.publicChatBox.nativeElement.scrollHeight -
            this.publicChatBox.nativeElement.clientHeight;
        this.mitext = '';
        this.speechService.mitext = this.mitext;
        this.service.setComment(text, this.userService.dbUser.id, this.news$.id);
    }
    micStop(stream: MediaStream) {
        let tracks = null;
        if (stream != null) {
            tracks = stream.getTracks();
        }
        if (tracks != null) {
            tracks.forEach(function (track) {
                track.stop();
            });
        }
    }
}
