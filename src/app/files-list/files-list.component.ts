import {Component, Input, OnInit} from '@angular/core';
import {News} from '../core/news.model';
import {BackendServiceService} from '../core/backend-service.service';
import {DomSanitizer} from '@angular/platform-browser';
import { WindowRef } from '../core/window.service';

@Component({
    selector: 'app-files-list',
    templateUrl: './files-list.component.html',
    styleUrls: ['./files-list.component.scss']
})
export class FilesListComponent implements OnInit {
    itemWidth: number;
    private _thumbName: string;
    private _imgUrl: string;
    private _news: News;
    width: number;
    height: number;
    constructor(private backend: BackendServiceService, private sanitizer: DomSanitizer,
        private winRef: WindowRef) {
    }

    @Input()
    get news() {
        return this._news;
    }

    set news(value: News) {
        this._news = value;
        if (!this._thumbName) {
            this._thumbName = this._news.id + '-thumb-kapak-' + this._news.mediaReviews[0].file_name;
        }
    }

    @Input()
    get thumbName() {
        return this._thumbName;
    }

    set thumbName(thumbName: string) {
        this._thumbName = thumbName;
        if (!this._imgUrl) {
            if (thumbName.includes('medium-')) {
                this.itemWidth = this.winRef.nativeWindow.innerWidth - 20;
                if (this.itemWidth > 788) { this.itemWidth = 788; }
                this.width = this.itemWidth;
                this.height = 500 * (this.itemWidth / 788);
            } else {
                this.width = 174;
                this.height = 109;
            }

            // this.getUrlReview(this._thumbName).then(value => this.imgUrl = value);
          // this.imgUrl = 'https://storage.googleapis.com/sentral-news-media/' + thumbName;
          this._imgUrl = '/assets/' + thumbName;
        }
    }

    ngOnInit() {
    }

    get imgUrl(): string {
        return this._imgUrl;
    }

    set imgUrl(value: string) {
        this._imgUrl = value;
    }
}
