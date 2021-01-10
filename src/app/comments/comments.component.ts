import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  private _url: string;

  constructor() { }

  @Input()
  get url(): string {
      return this._url;
  }
  set url(value: string) {
      this._url = value;
  }
  ngOnInit(): void {
  }

}
