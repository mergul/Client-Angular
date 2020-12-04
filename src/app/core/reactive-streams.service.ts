import { Injectable, NgZone } from '@angular/core';
import { EventSourcePolyfill } from 'event-source-polyfill';

import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { NewsPayload } from './news.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { RecordSSE } from './RecordSSE';
import { BalanceRecord } from './user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ReactiveStreamsService {

    private reportedEventSource: EventSourcePolyfill;
    private newsEventSource: EventSourcePolyfill;
    private sources: EventSourcePolyfill[] = [];
    private newsBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private tagsBehaviorSubject = new BehaviorSubject<RecordSSE[]>([]);
    private countsBehaviorSubject = new BehaviorSubject<RecordSSE[]>([]);
    private publicBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private remustBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private residdBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private reportedBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private recountsBehaviorSubject = new BehaviorSubject<RecordSSE[]>([]);
    rlinks: string[] = ['Ençok Şikayet', 'Müstehcen', 'Şiddet'];
    nlinks = ['En Çok Okunanlar', 'Takip Edilen Etiketler', 'Takip Edilen Kişiler'];
    private ntagBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private npeopleBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private meBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private repoBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
    private balanceBehaviorSubject = new BehaviorSubject<BalanceRecord[]>([]);
    publicStreamList$: Map<string, NewsPayload[]> = new Map<string, NewsPayload[]>();
    myListener: any;
    private hotUsersBehaviorSubject = new BehaviorSubject<BalanceRecord[]>([]);
    random: number;

    constructor(private zone: NgZone, protected http: HttpClient
    ) {
    }
    getNewsStream(processName: number, url: string) {
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('accept', 'text/event-stream')
            .append('X-Custom-Header', 'last-event-id');

        this.newsEventSource = new EventSourcePolyfill(url, { headers: headers, withCredentials: true, heartbeatTimeout: 10000 });
        this.sources.push(this.newsEventSource);
        this.newsEventSource.addEventListener('top-news-' + processName, event => {
            const topNews = JSON.parse(event.data);
            const list = this.newsBehaviorSubject.getValue();
            this.zone.run(() => this.newsBehaviorSubject.next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('top-news', event => {
            const topNews = JSON.parse(event.data);
            const list = this.newsBehaviorSubject.getValue();
            this.zone.run(() => this.newsBehaviorSubject.next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('top-tags', event => {
            const topTags = JSON.parse(event.data);
            this.zone.run(() => this.tagsBehaviorSubject.next(topTags.list));
        });
        this.newsEventSource.addEventListener('user-counts', event => {
            const userCounts = JSON.parse(event.data);
            this.zone.run(() => this.countsBehaviorSubject.next(userCounts));
        });
        this.newsEventSource.addEventListener('close', event => {
            this.closeSources(this.random);
        });
        this.newsEventSource.onerror = err => this.zone.run(() => {
            if (this.newsEventSource.readyState === 0) {
                //  this.newsEventSource.close();
                this.newsBehaviorSubject.next([]);
            } else {
                this.newsBehaviorSubject.error('EventSource error:::' + err.statusText);
                this.tagsBehaviorSubject.error('EventSource error:::' + err.statusText);
                this.countsBehaviorSubject.error('EventSource error:::' + err.statusText);
            }
        });
        this.myListener = (ev) => this.listenIt(ev);
        this.myListener.bind(this);
    }
    getReportedSubject(id: string): BehaviorSubject<NewsPayload[]> {
        switch (id) {
            case 'main': return this.reportedBehaviorSubject;
            case '#Şiddet': return this.residdBehaviorSubject;
            case '#Müstehcen': return this.remustBehaviorSubject;
        }
    }
    getNewsSubject(id: string): BehaviorSubject<NewsPayload[]> {
        switch (id) {
            case 'main': return this.newsBehaviorSubject;
            case 'tags': return this.ntagBehaviorSubject;
            case 'people': return this.npeopleBehaviorSubject;
            case 'me': return this.meBehaviorSubject;
            case 'other': return this.publicBehaviorSubject;
        }
    }
    getMessage(sub): Observable<any> {
        switch (sub) {
            case this.nlinks[0]: return this.newsBehaviorSubject.asObservable();
            case 'top-tags': return this.tagsBehaviorSubject.asObservable();
            case this.rlinks[0]: return this.reportedBehaviorSubject.asObservable();
            case 'user-counts': return this.countsBehaviorSubject.asObservable();
            case 'user-countsr': return this.recountsBehaviorSubject.asObservable();
            case 'other-person': return this.publicBehaviorSubject.asObservable();
            case 'repo-person': return this.repoBehaviorSubject.asObservable();
            case this.rlinks[1]: return this.remustBehaviorSubject.asObservable();
            case this.rlinks[2]: return this.residdBehaviorSubject.asObservable();
            case this.nlinks[1]: return this.ntagBehaviorSubject.asObservable();
            case this.nlinks[2]: return this.npeopleBehaviorSubject.asObservable();
            case 'me': return this.meBehaviorSubject.asObservable();
            case 'user-history': return this.balanceBehaviorSubject.asObservable();
            case 'hotRecords': return this.hotUsersBehaviorSubject.asObservable();
        }
    }
    setListeners(id: string, random: number) {
        this.setFirstListeners(id, random);
        this.newsEventSource.addEventListener('top-news-' + id, event => {
            const topNews = JSON.parse(event.data);
            const list = this.getNewsSubject(event.lastEventId).getValue();
            this.zone.run(() => this.getNewsSubject(event.lastEventId).next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('top-news-tags-' + id, event => {
            const topNews = JSON.parse(event.data);
            const list = this.getNewsSubject(event.lastEventId).getValue();
            this.zone.run(() => this.getNewsSubject(event.lastEventId).next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('top-news-people-' + id, event => {
            const topNews = JSON.parse(event.data);
            const list = this.getNewsSubject(event.lastEventId).getValue();
            this.zone.run(() => this.getNewsSubject(event.lastEventId).next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('user-counts-' + id, event => {
            const userCounts = JSON.parse(event.data);
            this.zone.run(() => this.countsBehaviorSubject.next(userCounts));
        });
        this.newsEventSource.addEventListener('user-history-' + id, event => {
            const balances = JSON.parse(event.data);
            const list = this.balanceBehaviorSubject.getValue();
            this.zone.run(() => this.balanceBehaviorSubject.next([...list, ...balances]));
        });
        this.newsEventSource.addEventListener('hotRecords-' + id, event => {
            const balances = JSON.parse(event.data);
            const list = this.hotUsersBehaviorSubject.getValue();
            this.zone.run(() => this.hotUsersBehaviorSubject.next([...list, ...balances]));
        });
    }
    setFirstListeners(id: string, random: number) {
        this.newsEventSource.addEventListener('top-news-' + id + '-' + random, event => {
            const topNews = JSON.parse(event.data);
            const list = this.getNewsSubject(event.lastEventId).getValue();
            this.zone.run(() => this.getNewsSubject(event.lastEventId).next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('top-news-tags-' + id + '-' + random, event => {
            const topNews = JSON.parse(event.data);
            const list = this.getNewsSubject(event.lastEventId).getValue();
            this.zone.run(() => this.getNewsSubject(event.lastEventId).next([...list, ...topNews.list]));
        });
        this.newsEventSource.addEventListener('top-news-people-' + id + '-' + random, event => {
            const topNews = JSON.parse(event.data);
            const list = this.getNewsSubject(event.lastEventId).getValue();
            this.zone.run(() => this.getNewsSubject(event.lastEventId).next([...list, ...topNews.list]));
        });
    }
    listenIt = (event: any) => {
        if (event.lastEventId === 'me' || event.lastEventId === 'tag') {
            this.addToSubject(this.getNewsSubject(event.lastEventId === 'tag' ? 'tags' : event.lastEventId), event);
        }
    }
    addToSubject = (subj: BehaviorSubject<NewsPayload[]>, event: any) => {
        const topNews = JSON.parse(event.data);
        this.zone.run(() => {
            const array2 = [];
            const array3 = [];
            subj.getValue().map(xx => {
                array2.push(xx.newsId);
                array3.push(xx);
            });
            topNews.list.forEach(df => {
                if (!array2.includes(df.newsId)) {
                    array3.push(df);
                }
            });
            subj.next(array3);
        });
    }
    resetUserListListeners(id: string) {
        this.newsEventSource.removeEventListener('top-news-' + id, this.myListener, true);
        if (id.charAt(0) === '@') {
            const pj = this.npeopleBehaviorSubject.getValue().filter(nh => nh.newsOwnerId !== id.substring(1));
            this.npeopleBehaviorSubject.next(pj);
        } else {
            const tj = this.ntagBehaviorSubject.getValue().filter(nh => !nh.tags.includes(id));
            this.ntagBehaviorSubject.next(tj);
        }
    }
    setUserListListeners(id: string, random: number) {
        this.newsEventSource.addEventListener('top-news-follow-' + id + '-' + random, this.myListener, true);
        this.newsEventSource.addEventListener('top-news-' + id, this.myListener, true);
    }
    setOtherListener(id: string, random: number, isRepo: boolean) {
        if (!isRepo) {
            this.newsEventSource.addEventListener('top-news-other-' + id + '-' + random, event => {
                const topNews = JSON.parse(event.data);
                this.zone.run(() => {
                    this.publicBehaviorSubject.next(topNews.list);
                    this.publicStreamList$.set(id.substring(1), topNews.list);
                });
            });
            this.newsEventSource.addEventListener('user-counts-' + id, event => {
                const userCounts = JSON.parse(event.data);
                this.zone.run(() => this.countsBehaviorSubject.next(userCounts));
            });
        } else {
            this.reportedEventSource.addEventListener('top-newsr-' + id, event => {
                const topNewsr = JSON.parse(event.data);
                this.zone.run(() => this.repoBehaviorSubject.next(topNewsr.list));
            });
        }
    }
    statusOfNewsSource = () => {
        return this.newsEventSource;
    }
    closeSources(random) {
        fetch('/sse/unsubscribe', {
            keepalive: true,
            method: 'PATCH',
            body: 'TopNews' + random,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        this.sources.forEach((value: EventSourcePolyfill) => {
            value.close();
        });
        console.log('Event Sources closed!');
    }
    // getReportsStream(processName: string, url: string) {
    //     let headers: HttpHeaders = new HttpHeaders();
    //     headers = headers.append('accept', 'text/event-stream')
    //         .append('X-Custom-Header', 'last-event-id');
    //     this.reportedEventSource = new EventSourcePolyfill(url, { headers: headers, withCredentials: true });
    //     this.sources.push(this.reportedEventSource);
    //     this.reportedEventSource.addEventListener('top-newsr', event => {
    //         const topNewsR = JSON.parse(event.data);
    //         this.zone.run(() => this.getReportedSubject(event.lastEventId).next(topNewsR.list));
    //     });
    //     this.reportedEventSource.addEventListener('user-countsr', event => {
    //         const userCountsr = JSON.parse(event.data);
    //         this.zone.run(() => this.recountsBehaviorSubject.next(userCountsr));
    //     });
    //     this.reportedEventSource.onerror = err => this.zone.run(() => {
    //         if (this.reportedEventSource.readyState === 0) {
    //             //  this.reportedEventSource.close();
    //         } else {
    //             switch (processName) {
    //                 case 'top-newsr': {
    //                     this.reportedBehaviorSubject.error('EventSource error: ' + processName + ' ::' + err);
    //                     break;
    //                 }
    //                 case 'user-countsr': {
    //                     this.recountsBehaviorSubject.error('EventSource error: ' + processName + ' ::' + err);
    //                     break;
    //                 }
    //             }
    //         }
    //     });
    // }
}
