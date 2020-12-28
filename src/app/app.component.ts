import { Observable, of, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit, HostListener, NgZone, Renderer2, Inject
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Location, DOCUMENT } from '@angular/common';
import { NewsService } from './core/news.service';
import { AuthService } from './core/auth.service';
import { UserService } from './core/user.service';
import { FirebaseUserModel } from './core/user.model';
import { ReactiveStreamsService } from './core/reactive-streams.service';
import { WindowRef } from './core/window.service';
import { RecordSSE } from './core/RecordSSE';
// import * as WebFontLoader from 'webfontloader';
// import { SpeechService } from './core/speech-service';
import { ScriptLoaderService } from './core/script-loader.service';

declare var gtag;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    private readonly onDestroy = new Subject<void>();
    isFontsLoaded = false;
    newsCounts$: Map<string, string> = new Map<string, string>();
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    user: FirebaseUserModel;
    _topTags: Observable<Array<RecordSSE>>;
    public state$: Observable<{ [key: string]: string }>;
    listStyle = {};
    private newslistUrl: string;
    cssUrl: string;
    twttr: any;
    myWis: number;

    constructor(
        private reactiveService: ReactiveStreamsService, public service: UserService,
        private zone: NgZone, private scriptService: ScriptLoaderService, private router: Router,
        public location: Location, public authService: AuthService, public newsService: NewsService,
        private winRef: WindowRef, private renderer: Renderer2, @Inject(DOCUMENT) private _document: Document) {
        this.state$ = this.router.events
            .pipe(
                filter(e => e instanceof NavigationStart),
                map(() => this.router.getCurrentNavigation().extras.state)
            );
            if (!this.reactiveService.random) {
                this.reactiveService.random = Math.floor(Math.random() * (999999 - 100000)) + 100000;
            }
            this.newslistUrl = '/sse/chat/room/TopNews' + this.reactiveService.random + '/subscribeMessages';
        this.router.events
            .pipe(
                filter(e => e instanceof NavigationEnd),
                map((event: NavigationEnd) => event.url
               // gtag('config', 'UA-167472179-1', { page_path: event.urlAfterRedirects }) 
                  )
            ).subscribe(fer=>this.newsService.prevUrl=fer);
        
    }

    ngOnInit() {
        this.myWis = this.winRef.nativeWindow.innerWidth;
        this.listStyle = {
            width: `${(this.myWis - 617) / 2}px`,
            paddingLeft: `${(this.myWis - 617) / 6}px`
        };
    }
    @HostListener('window:beforeunload', ['$event'])
    doSomething() {
        this.reactiveService.closeSources();
    }
    // @HostListener('document:visibilitychange', ['$event'])
    // visibilitychange() {
    //     this.checkHiddenDocument();
    // }
    checkMedia() {
       return this.myWis < 600;
    }
    // checkHiddenDocument() {
    //     if (document.hidden) {
    //         this.reactiveService.closeSources();
    //     }
    // }

    get loggedinUser(): Observable<boolean> {
        return of(this.service.loggedUser != null);
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
    }

    btnClick(url: string) {
        this.router.navigateByUrl(url);
    }

    searchWrapperStyle() {
        return { marginRight: `${0}%` };
    }

    ngAfterViewInit(): void {
        this.zone.run(() => {
            this.winRef.nativeWindow.onload = () => {
                if (!this.reactiveService.statusOfNewsSource()) {
                    this.reactiveService.getNewsStream(this.reactiveService.random, this.newslistUrl);
                }

                if (!this.newsService.newsStreamList$) {
                    this.newsService.newsStreamList$ = this.reactiveService.getMessage(this.links[0]);
                    this.newsService.tagsStreamList$ = this.reactiveService.getMessage(this.links[1]);
                    this.newsService.peopleStreamList$ = this.reactiveService.getMessage(this.links[2]);
                    this.newsService.meStreamList$ = this.reactiveService.getMessage('me');
                    this.newsService.newsStreamCounts$ = this.reactiveService.getMessage('user-counts')
                        .pipe(map(record => {
                            if (record.key) {
                                this.newsService.newsCounts$.set(record.key, String(record.value));
                            }
                            return record;
                        }));
                }
               // if (!this.newsService.topTags) {
                    this.newsService.topTags = this.reactiveService.getMessage('top-tags')
                        .pipe(map(value =>
                            value.filter(value1 =>
                                value1.key.charAt(0) === '#')));
              //  }
                // WebFontLoader.load({
                //     google: {
                //         families: ['Roboto:300,400,500&display=swap']
                //     }
                // });
                // this.scriptService.injectScript(this.renderer, this._document,
                //      'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css', 'link',
                //  '', 'sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh', 'anonymous').then(val => val);
                this.scriptService.injectScript(this.renderer, this._document, 'https://fonts.googleapis.com/icon?family=Material+Icons'
                , 'link', '1', '', 'anonymous')
                .then(val => val);
                // this.scriptService.injectScript('https://platform.twitter.com/widgets.js', 'script', 'twitter-wjs', '', '').then(val => {
                //     this.twttr = (window as any).global.twttr;
                //     this.twttr.widgets.load();
                // });
            //     this.scriptService.injectScript(this.renderer, this._document,
            //         'https://www.googletagmanager.com/gtag/js?id=UA-167472179-1', 'script', '', '', 'anonymous')
            //    .then(val => val);
            if (this.location.isCurrentPathEqualTo('/user')) {
                this.scriptService.injectScript(this.renderer, this._document,
                    'https://webrtc.github.io/adapter/adapter-latest.js', 'script', '2', '', 'anonymous')
               .then(val => val);
               this.scriptService.injectScript(this.renderer, this._document,
                   'https://cdn.jsdelivr.net/npm/video-stream-merger@3.6.1/dist/video-stream-merger.min.js', 'script', '3', '', 'anonymous')
              .then(val => val);
            } // && !this.location.path().includes('/allusers/')
                if (!this.service.dbUser && !this.location.path().startsWith('/user') && this.location.path() !== '/login' &&
                    this.location.path() !== '/upload' &&
                    this.location.path() !== '/talepler' && this.location.path() !== '/admin') {
                    this.authService.getCurrentUser().then(value => {
                        if (value) {
                            this.service.user = new FirebaseUserModel();
                            this.service.user.image = value.providerData[0].photoURL;
                            this.service.user.email = value.providerData[0].email;
                            this.service.user.name = value.displayName;
                            this.service.user.id = value.uid;
                            this.service.user.token = value['ra'];
                            value.getIdToken().then(idToken => {
                                this.service.user.token = idToken;
                                this.service.loggedUser = this.service.user;
                            });
                          // this.speechService.say({lang: 'en', text: 'Hello' + value.displayName + 'Have a nice day?'});
                        }
                    }).catch(() => {
                        // console.log('Bu mu dur', reason);
                    });
                }
                // this.matIconRegistry.addSvgIcon(
                //     'sentral',
                //     this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/compass.svg')
                // );
            };
        });
    }
}
