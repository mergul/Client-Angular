import {AfterViewInit, Component, OnInit, NgZone, Renderer2, Inject} from '@angular/core';
import { ScriptLoaderService } from '../core/script-loader.service';
import { WindowRef } from '../core/window.service';
import { DOCUMENT } from '@angular/common';
declare interface Window {
  adsbygoogle: any[];
}

declare var adsbygoogle: any[];
@Component({
  selector: 'app-ads',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent implements OnInit, AfterViewInit {
  twttr: any;

  constructor(private scriptService: ScriptLoaderService, private zone: NgZone, private winRef: WindowRef
    , private renderer: Renderer2, @Inject(DOCUMENT) private _document: Document) { }

  ngOnInit() {
    this.zone.run(() => {
      // this.scriptService.injectScript(this.renderer, this._document,
      //   'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', 'script', '', 'ca-pub-3428031914463355', '')
      //   .then(() => {
      //     try {
      //       (adsbygoogle = (window as any).global.adsbygoogle || [])
      //         .push({ });
      //     } catch (e) {
      //       console.error(e);
      //     }
      //   });
    });
  }
  ngAfterViewInit() {
    // this.zone.run(() => {
    //   this.renderer.listen('window', 'load', () => {
    //  // this.winRef.nativeWindow.onload = () => {
    //     this.scriptService.injectScript(this.renderer, this._document,
    //       'https://platform.twitter.com/widgets.js', 'script', 'twitter-wjs', '', 'anonymous')
    //       .then(val => {
    //         this.twttr = (window as any).global.twttr;
    //         this.twttr.widgets.load();
    //       });
        // this.scriptService.injectScript(this.renderer, this._document,
        //   'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', 'script', '', 'ca-pub-3428031914463355', '')
        //   .then(() => {
        //     try {
        //       (adsbygoogle = (window as any).global.adsbygoogle || [])
        //         .push({});
        //     } catch (e) {
        //       console.error(e);
        //     }
        //   });
  //     });
  // });
  }
}
