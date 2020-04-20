import {AfterViewInit, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-ads',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    try {
      (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
    } catch (e) {}
  }
}
