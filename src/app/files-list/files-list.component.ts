import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {News} from '../core/news.model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { WindowRef } from '../core/window.service';

@Component({
    selector: 'app-files-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './files-list.component.html',
    styleUrls: ['./files-list.component.scss']
})
export class FilesListComponent implements OnInit {
    itemWidth: number;
    private _thumbName: string;
    _imgUrl: SafeUrl;
    private _news: News;
    width: number;
    height: number;

    constructor(public sanitizer: DomSanitizer,
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
        const ja = thumbName.lastIndexOf('.');
        this._thumbName = thumbName.slice(0, ja) + '.jpeg';
        this.itemWidth = this.winRef.nativeWindow.innerWidth - 40;
        if (!this._imgUrl) {
            if (this._thumbName.includes('medium-')) {
                if (this.itemWidth > 788) { this.itemWidth = 788; }
                this.width = this.itemWidth;
                this.height = 500 * (this.itemWidth / 788);
            } else {
                if (this.itemWidth > 1040) {
                    this.width = 174;
                    this.height = 109;
                } else {
                    this.width = 174 * (4 / 5);
                    this.height = 109 * (4 / 5);
                }
            }

            // this.getUrlReview(this._thumbName).then(value => this.imgUrl = value);
          // this.imgUrl = 'https://storage.googleapis.com/sentral-news-media/' + thumbName;
          this._imgUrl = this.sanitizer.bypassSecurityTrustUrl('assets/' + this._thumbName);
        }
    }

    ngOnInit() {
    }
}
