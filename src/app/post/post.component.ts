import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  _url: any;
  _srcUrl: SafeUrl;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {

  }
  @Input()
  get url() {
      return this._url;
  }

  set url(url: string) {
      this._url = 'url('+ url +')';;
  }
  @Input()
  get srcUrl(): SafeUrl {
      return this._srcUrl;
  }

  set srcUrl(url: SafeUrl) {
      this._srcUrl = url;
  }
}
