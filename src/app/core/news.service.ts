import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { News, NewsPayload } from './news.model';
import { RecordSSE } from './RecordSSE';

@Injectable({ providedIn: 'root' })
export class NewsService {

    callToggle: Subject<number> = new Subject();
    callTag: Subject<string> = new Subject();
    newsApiRoot = '/api/rest/news/list';
    newsRoot = '/api/rest/news/get/';
    adlinks = ['Ençok Şikayet', 'Müstehcen', 'Şiddet'];
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    newsCounts$: Map<string, string> = new Map<string, string>();
    reportedNewsCounts$: Map<string, string> = new Map<string, string>();
    newzes$: Map<string, News> = new Map<string, News>();
    private _activeLink: string;
    prevLink: number;
    controller = new AbortController();
    signal = this.controller.signal;
    newsPayload: any;
    newsList$: Observable<NewsPayload[]>;
    newsStreamList$: Observable<NewsPayload[]>;
    tagsStreamList$: Observable<NewsPayload[]>;
    peopleStreamList$: Observable<NewsPayload[]>;
    topTags: Observable<Array<RecordSSE>>;
    mlink: string;
    newsStreamCounts$: Observable<RecordSSE>;
    meStreamList$: Observable<NewsPayload[]>;
    list$: NewsPayload[];
    preList = [];
    _isConnected = true;
    prevUrl: string;
    preModalUrl: string;
    endPlayer: Subject<boolean>=new Subject();

    constructor(protected http: HttpClient) {
    }

    setNewsList(tags: Array<string>, byOwners: boolean) {
        if (byOwners) {
            this.newsList$ = this.peopleStreamList$;
        } else if (tags.length === 0) {
            this.newsList$ = of([]);
        } else if (tags.length === 1) {
            if (tags[0] !== 'main') {
                this.newsList$ = this.tagsStreamList$;
            } else { this.newsList$ = this.newsStreamList$; }
        } else {
            this.newsList$ = this.tagsStreamList$;
        }
    }

    getTopNewsList(etiket: string): Observable<Array<NewsPayload>> {
        return this.http.get<Array<NewsPayload>>('/sse/topnewslist/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    setNewsUser(etiket: string, random: number): Observable<boolean> {
        return this.http.get<boolean>('/sse/setUser/' + encodeURIComponent(etiket) + '/' + random, {
            responseType: 'json', withCredentials: true
        });
    }
    setRepoUser(etiket: string): Observable<boolean> {
        return this.http.get<boolean>('/reported/setUser/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    getTopReportedList(list: Array<string>): Observable<Array<News>> {
        return this.http.get<Array<News>>('/api/rest/news/topReportedList/' + list, {
            responseType: 'json', withCredentials: true
        });
    }
    getNewsById(id: string): Observable<News> {
        if (this.newzes$.has(id)) {
            // fetch('/api/rest/news/setNewsCounts/' + id, {
            //     keepalive: true,
            //     method: 'GET',
            //     headers: {
            //       'Content-Type': 'application/json',
            //     },
            //   });
            fetch('/sse/setNewsCounts', {
                keepalive: true,
                method: 'PATCH',
                body: JSON.stringify(this.extractNewsPayload(this.newzes$.get(id))),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return of(this.newzes$.get(id));
            // return this.http.get<boolean>('/api/rest/news/setNewsCounts/' + id, {
            //     responseType: 'json', withCredentials: true
            // }).pipe(switchMap(() => of(news)));
        } else {
            return this.http.get<News>('/api/rest/news/get/' + id, {
                responseType: 'json', withCredentials: true
            });
        }
    }
    extractNewsPayload(news: News): any {
        return {
            'newsId': news.id, 'newsOwner': news.owner, 'tags': news.tags, 'topics': news.tags, 'clean': news.clean,
            'newsOwnerId': news.ownerId, 'ownerUrl': news.ownerUrl, 'topic': news.topic, 'thumb': news.mediaReviews[0].file_name, 'count': +news.count, 'date': news.date
        };
    }

    getNewsByOwnerId(id: string): Observable<Array<News>> {
        return this.http.get<Array<News>>('/api/rest/news/getNewsByOwnerId/' + id, {
            responseType: 'json', withCredentials: true
        });
    }
    get activeLink(): string {
        return this._activeLink;
    }

    set activeLink(value: string) {
        if (value && !this.links.includes(value) && (!this.mlink || this.links.includes(this._activeLink))) {
            this.mlink = this._activeLink;
        }
        if (this._activeLink !== value) {
            this.prevLink = this.links.indexOf(this._activeLink);
            this._activeLink = value;
        }
    }
    get newsCounts(): Map<string, string> {
        return this.newsCounts$;
    }
    set newsCounts(newsCounts: Map<string, string>) {
        this.newsCounts$ = newsCounts;
    }

    get isConnected(): boolean {
        return this._isConnected;
    }

    set isConnected(v: boolean) {
        this._isConnected = v;
    }


    get reportedNewsCounts(): Map<string, string> {
        return this.reportedNewsCounts$;
    }
    set reportedNewsCounts(reportedNewsCounts: Map<string, string>) {
        this.reportedNewsCounts$ = reportedNewsCounts;
    }
    getReportedNewsListCounts(list: Array<string>): Observable<Array<RecordSSE>> {
        return this.http.get<Array<RecordSSE>>('/reported/reportednewslist/' + list, {
            responseType: 'json', withCredentials: true
        });
    }
    getTopReportedNewsList(etiket: string): Observable<Array<RecordSSE>> {
        return this.http.get<Array<RecordSSE>>('/reported/topreportednewslist/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    getUserTopReportedNewsList(id: string): Observable<Array<RecordSSE>> {
        return this.http.get<Array<RecordSSE>>('/reported/topreportednewslist/@' + encodeURIComponent(id), {
            responseType: 'json', withCredentials: true
        });
    }

    sendReport(newsPayload1: NewsPayload, admin: boolean) {
        const jp = admin ? 'admin' : 'user';
        return this.http.post<boolean>('/api/rest/news/sendreport/' + jp, newsPayload1, {
            responseType: 'json', withCredentials: true
        }).pipe();

    }
    deleteNewsById(id: string): Observable<boolean> {
        return this.http.delete<boolean>('/api/rest/news/delete/' + id, {
            responseType: 'json', withCredentials: true
        });
    }

    clearNews(id: string) {
        return this.http.patch<boolean>('/api/rest/news/clearNews', id, {
            responseType: 'json', withCredentials: true
        });
    }
    clearReportedNews(id: string): Observable<boolean> {
        return this.http.patch<boolean>('/reported/clearIt', id, {
            responseType: 'json', withCredentials: true
        });
    }
    partitionMoney(para: number): Observable<number> {
        return this.http.post<number>('/api/rest/admin/partitionMoney', para, {
            responseType: 'json', withCredentials: true
        });
    }
    setStoreValues() {
        return this.http.post<boolean>('/balance/rest/admin/newzstores', '0', {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
    setComment(comment: string, userId: string, newsId: string) {
        return this.http.post<boolean>('/api/rest/news/comments', {
            'newsId': newsId, 'userId': userId,
            'comment': comment, 'date': new Date()
        }, {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
}
