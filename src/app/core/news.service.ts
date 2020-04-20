import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { News, NewsPayload } from './news.model';
import { RecordSSE } from './RecordSSE';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NewsService {

    // private readonly onDestroy = new Subject<void>();
    newsApiRoot = '/api/rest/news/list';
    newsRoot = '/api/rest/news/get/';
    adlinks = ['Ençok Şikayet', 'Müstehcen', 'Şiddet'];
    links = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    newsCounts$: Map<string, string> = new Map<string, string>();
    reportedNewsCounts$: Map<string, string> = new Map<string, string>();
    newzes$: Map<string, News> = new Map<string, News>();
    private _activeLink: string;
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

    constructor(protected http: HttpClient) {
    }
    get newsList(): Observable<NewsPayload[]> {
        return this.newsList$;
    }
    set newsList(newsLists: Observable<NewsPayload[]>) {
        this.newsList$ = newsLists;
    }
    setNewsList(tags: Array<string>, byOwners: boolean) {
        if (byOwners) {
            this.newsList$ = this.peopleStreamList$;
            //  this.newsStreamList$.pipe(map(value => value.filter(value1 =>
            //          tags.includes('@' + value1.newsOwnerId))));
        } else if (tags.length === 0) {
            this.newsList$ = of([]);
        } else if (tags.length === 1) {
            if (tags[0] !== 'main') {
                this.newsList$ = this.tagsStreamList$;
                // this.newsStreamList$.pipe(map(value => value.filter(value1 => value1.topics.includes(tags[0]))));
            } else { this.newsList$ = this.newsStreamList$; }
        } else {
            this.newsList$ = this.tagsStreamList$;
            //  this.newsStreamList$.pipe(map(value => value.filter(value1 =>
            //          tags.some(value2 => value1.topics.includes(value2)))));
        }
    }

    getTopNewzList(etiketler: Array<string>): Observable<Array<NewsPayload>> {
        return this.http.get<Array<NewsPayload>>('/sse/topnewzlist/' + etiketler, {
            responseType: 'json', withCredentials: true
        });
    }
    getNewsByOwnerIds(ids: Array<string>): Observable<Array<NewsPayload>> {
        return this.http.get<Array<NewsPayload>>('/api/rest/news/getNewsByOwnerIds/' + ids, {
            responseType: 'json', withCredentials: true
        });
    }
    getTopNewsList(etiket: string): Observable<Array<NewsPayload>> {
        return this.http.get<Array<NewsPayload>>('/sse/topnewslist/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    setNewsUser(etiket: string): Observable<boolean> {
        return this.http.get<boolean>('/sse/setUser/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    setRepoUser(etiket: string): Observable<boolean> {
        return this.http.get<boolean>('/reported/setUser/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    getList(): Observable<Array<NewsPayload>> {
        // let apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20`;
        const apiURL = `${this.newsApiRoot}`;
        return this.http.get<Array<NewsPayload>>(apiURL);
    }
    getTopList(list: Array<string>): Observable<Array<News>> {
        return this.http.get<Array<News>>('/api/rest/news/topList/' + list, {
            responseType: 'json', withCredentials: true
        });
    }
    getTopReportedList(list: Array<string>): Observable<Array<News>> {
        return this.http.get<Array<News>>('/api/rest/news/topReportedList/' + list, {
            responseType: 'json', withCredentials: true
        });
    }
    getNewsPayload(news: News) {
        return {'newsId': news.id, 'newsOwner': news.owner, 'tags': news.tags, 'topics': news.tags,
         'clean': news.clean, 'newsOwnerId': news.ownerId, 'topic': news.topic, 'thumb': news.mediaReviews[0].file_name,
         'count': news.count, 'date': news.date};
    }
    getNewsById(id: string): Observable<News> {
        if (this.newzes$.has(id)) {
            const news = this.newzes$.get(id);
            // const newsPayload = this.getNewsPayload(news);
            // return this.http.put<boolean>('/sse/setNewsCounts', newsPayload, {
            //     responseType: 'json', withCredentials: true
            // }).pipe(switchMap(() => of(news)));
            return this.http.get<boolean>('/api/rest/news/setNewsCounts/' + id, {
                responseType: 'json', withCredentials: true
            }).pipe(switchMap(() => of(news)));
        } else {
            return this.http.get<News>('/api/rest/news/get/' + id, {
                responseType: 'json', withCredentials: true
            });
        }
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
        this._activeLink = value;
    }
    get newsCounts(): Map<string, string> {
        return this.newsCounts$;
    }
    set newsCounts(newsCounts: Map<string, string>) {
        this.newsCounts$ = newsCounts;
    }

    get reportedNewsCounts(): Map<string, string> {
        return this.reportedNewsCounts$;
    }
    set reportedNewsCounts(reportedNewsCounts: Map<string, string>) {
        this.reportedNewsCounts$ = reportedNewsCounts;
    }
    getNewsByCounts(id: string) {
        return this.http.get<string>('/sse/news/' + id, {
            responseType: 'json', withCredentials: true
        });
    }
    getUsersByCounts(id: string) {
        return this.http.get<string>('/sse/users/' + id, {
            responseType: 'json', withCredentials: true
        });
    }

    getNewsListCounts(list: Array<string>): Observable<Array<RecordSSE>> {
        // @ts-ignore
        return this.http.get<Array<RecordSSE>>('/sse/newslist/' + list, {
            responseType: 'json', withCredentials: true
        });
    }

    getUserTopNewsList(id: string): Observable<Array<NewsPayload>> {
        return this.http.get<Array<NewsPayload>>('/sse/topnewslist/@' + id, {
            responseType: 'json', withCredentials: true
        });
    }
    getReportedNewsListCounts(list: Array<string>): Observable<Array<RecordSSE>> {
        // @ts-ignore
        return this.http.get<Array<RecordSSE>>('/reported/reportednewslist/' + list, {
            responseType: 'json', withCredentials: true
        });
    }
    getTopReportedNewsList(etiket: string): Observable<Array<RecordSSE>> {
        //   const params = new HttpParams({encoder: this.customEncoder});
        return this.http.get<Array<RecordSSE>>('/reported/topreportednewslist/' + encodeURIComponent(etiket), {
            responseType: 'json', withCredentials: true
        });
    }
    getUserTopReportedNewsList(id: string): Observable<Array<RecordSSE>> {
        return this.http.get<Array<RecordSSE>>('/reported/topreportednewslist/@' + encodeURIComponent(id), {
            responseType: 'json', withCredentials: true
        });
    }
    getStartCounts(): Observable<Array<RecordSSE>> {
        return this.http.get<Array<RecordSSE>>('/sse/newscounts', {
            responseType: 'json', withCredentials: true
        });
    }

    sendReport(newsPayload1: NewsPayload, admin: boolean) {
        const jp = admin ? 'admin' : 'user';
        return this.http.post<boolean>('/api/rest/news/sendreport/' + jp, newsPayload1, {
            responseType: 'json', withCredentials: true
        }).pipe();

    }

    getTopTags(): Observable<Array<RecordSSE>> {
        return this.http.get<Array<RecordSSE>>('/sse/toptagslist', {
            responseType: 'json', withCredentials: true
        });
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
        return this.http.post<number>('/balance/rest/admin/partitionMoney', para, {
            responseType: 'json', withCredentials: true
        });
    }
    setStoreValues() {
        return this.http.post<boolean>('/balance/rest/admin/newzstores', '0', {
            responseType: 'json', withCredentials: true
        }).pipe();
    }
}
