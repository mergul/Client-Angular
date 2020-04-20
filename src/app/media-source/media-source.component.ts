import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BackendServiceService} from '../core/backend-service.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Review} from '../core/news.model';

@Component({
    selector: 'app-media-source',
    templateUrl: './media-source.component.html',
    styleUrls: ['./media-source.component.scss']
})
export class MediaSourceComponent implements OnInit, OnDestroy {
    private _review: Review = new Review();

    constructor(private sanitizer: DomSanitizer, private backend: BackendServiceService) {}

    @Input()
    get review() {
        return this._review;
    }

    set review(review: Review) {
        this._review = review;
    }

    ngOnInit() {}

    ngOnDestroy(): void {}
}
