import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NewsService} from '../core/news.service';

@Component({
  selector: 'app-req',
  templateUrl: './req.component.html',
  styleUrls: ['./req.component.scss']
})
export class ReqComponent implements OnInit, AfterViewInit, OnDestroy {
  showModal: Observable<boolean> = of(false);
  listenerFn: () => void;
  constructor(private router: Router,
              private location: Location,
              private newsService: NewsService
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.showModal = of(true);
  }

  onClose() {
    this.newsService.activeLink = 'En Çok Okunanlar';
    this.showModal = of(false);
    // Allow fade out animation to play before navigating back
    setTimeout(
        () => this.location.back(), // this.router.navigate(['/']),
        100
    );
  }

  onDialogClick(event: UIEvent) {
    // Capture click on dialog and prevent it from bubbling to the modal background.
    event.stopPropagation();
    event.cancelBubble = true;
  }

  ngOnDestroy() {
    if (this.listenerFn) {
      this.listenerFn();
    }
  }
}
