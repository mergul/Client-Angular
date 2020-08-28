import {Component, OnInit} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, map} from 'rxjs/operators';

import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import {SearchService} from '../core/search.service';
import {Router} from '@angular/router';
import {NewsService} from '../core/news.service';
import { NewsPayload } from '../core/news.model';
import { User } from '../core/user.model';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    newsSubject: BehaviorSubject<NewsPayload[]> = new BehaviorSubject<NewsPayload[]>([]);
    usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
    newsResults: Observable<Array<any>>;
    usersResults: Observable<Array<any>>;
    searchField: FormControl;
    searchForm: FormGroup;
    searchType: number;
    links: string[] = ['Kullanıcılar', 'Içerikler'];
    lastTerm: string;


    constructor(private searchService: SearchService,
                private router: Router, private newsService: NewsService,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        this.searchForm = this.fb.group({});
        this.searchField = new FormControl();
        this.activeLink = this.links[0];
        this.doJob();
        this.newsResults =  this.newsSubject.asObservable();
        this.usersResults =  this.usersSubject.asObservable();
    }

    doSearch(term: string): Observable<Array<any>> {
        this.searchType = this.activeLink === this.links[0] ? 0 : 1;
        this.lastTerm = term.charAt(0) === '@' || term.charAt(0) === '#' ? term.substring(1) : term;
        switch (this.searchType) {
            case 0:
                return this.searchService.searchPeople(this.lastTerm);
            case 1:
                return this.searchService.searchNews(this.lastTerm);
        }
    }

    onClick(link: string) {
        this.activeLink = link;
        if (link === this.links[0]) {
            this.searchType = 0;
            this.doSearch(this.lastTerm).subscribe(bv => this.usersSubject.next(bv));
        } else if (link === this.links[1]) {
            this.searchType = 2;
            this.doSearch(this.lastTerm).subscribe(bv => this.newsSubject.next(bv));
        }
    }

    private doJob() {
        return this.searchField.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(term => this.doSearch(term)),
            map(bb => this.activeLink === this.links[1] ? this.newsSubject.next(bb) : this.usersSubject.next(bb))
        ).subscribe();
    }
    get activeLink(): string {
        return this.newsService.activeLink;
    }

    set activeLink(value: string) {
        this.newsService.activeLink = value;
    }
}
