import {Component, Input, OnInit} from '@angular/core';
import {NewsService} from '../core/news.service';
import {Observable} from 'rxjs';
import {NewsPayload} from '../core/news.model';
import {Location} from '@angular/common';
import { map } from 'rxjs/operators';
import {UserService} from "../core/user.service";

@Component({
    selector: 'app-news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
    public state = '';

    constructor(private newsService: NewsService, public location: Location, public userService: UserService) {
    }

    newsList$: Observable<NewsPayload[]>;

    _orderBy = 'count';
    @Input()
    get activeLink(): string {
        return this.newsService.activeLink;
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
        this.newsList$ = value;
    }

    @Input()
    get orderBy(): string {
        return this._orderBy;
    }

    set orderBy(value: string) {
        this._orderBy = value;
    }

    ngOnInit() {
        this.state = window.history.state ? window.history.state.userID : this.state;
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
        if (!file_name) { file_name='bae.jpg'; }
        const ja = file_name.lastIndexOf('.');
        return 'thumb-kapak-' + file_name.slice(0, ja) + '.jpeg';
    }
}
