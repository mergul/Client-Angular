import { Component, OnDestroy } from '@angular/core';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { NewsDetailsComponent } from './news-details.component';
import { NewsService } from '../core/news.service';

@Component({
  selector: 'app-modal-container',
  template: ``
})
export class ModalContainerComponent implements OnDestroy {
  destroy = new Subject<any>();
  currentDialog = null;

  constructor(
    private modalService: NgbModal,
    private location: Location,
    route: ActivatedRoute,
    router: Router, private service: NewsService
  ) {
    route.paramMap.pipe(takeUntil(this.destroy),
    switchMap((params: ParamMap) => this.service.getNewsById(params.get('id')))).subscribe(news => {
        if (!this.service.newzes$.has(news.id)) { this.service.newzes$.set(news.id, news); }
        // When router navigates on this component is takes the params and opens up the photo detail modal
        this.currentDialog = this.modalService.open(NewsDetailsComponent, {centered: true});
        this.currentDialog.componentInstance.news$ = news;
        // Go back to home page after the modal is closed
        this.currentDialog.result.then(result => {
          if (result !== '') {
          router.navigateByUrl(result, {state: {userID: news.ownerId}});
          } else { this.location.back(); }
        }, reason => {
          this.location.back(); // router.navigateByUrl('/');
        });
    });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
