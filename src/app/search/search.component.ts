import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import {SearchService} from '../core/search.service';
import {Router} from '@angular/router';
import {NewsService} from '../core/news.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    results: Observable<Array<any>>;
    searchField: FormControl;
    searchForm: FormGroup;
    searchType: number;
    links: string[] = ['Kullanıcılar', 'Içerikler'];
    _activeLink: string;

    constructor(private searchService: SearchService,
                private router: Router, private newsService: NewsService,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        this.searchForm = this.fb.group({});
        this.searchField = new FormControl();
        this.activeLink = this.links[0];
        this.results = this.doJob('');
    }

    doSearch(term: string): Observable<Array<any>> {
        this.searchType = term.charAt(0) === '@' ? 0 : term.charAt(0) === '#' ? 1 : 2;
        this.activeLink = this.searchType === 0 ? this.links[0] : this.links[1];
        switch (this.searchType) {
            case 0:
                return this.searchService.searchPeople(term.substring(1));
            case 1:
                return this.searchService.searchNews(term.substring(1));
            case 2:
                return this.searchService.searchNews(term);
        }
    }

    onClick(link: string) {
        this._activeLink = link;
        if (link === this.links[0]) {
            this.results = this.doJob('@');
        } else {
            this.results = this.doJob('');
        }
    }

    private doJob(pre: string) {
        return this.searchField.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(term => this.doSearch(pre + term)),
        );
    }
    get activeLink(): string {
        return this._activeLink;
    }

    set activeLink(value: string) {
        this._activeLink = value;
    }
}
