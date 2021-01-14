import { Component, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { NewsDetailsComponent } from './news-details.component';
import { NewsService } from '../core/news.service';
import {MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material/dialog';
import { WindowRef } from '../core/window.service';

@Component({
  selector: 'app-details-container',
  template: ``
})
export class DialogDetailsContainerComponent implements OnDestroy {
  destroy = new Subject<any>();
  currentDialog: MatDialogRef<NewsDetailsComponent> = null;

  constructor( private modalService: MatDialog, private location: Location, private route: ActivatedRoute, private winRef: WindowRef,
    private router: Router, private service: NewsService
  ) {
    this.route.paramMap.pipe(takeUntil(this.destroy),
    switchMap((params: ParamMap) => this.service.getNewsById(params.get('id')))).subscribe(news => {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        const wid = this.winRef.nativeWindow.innerWidth;
        const modalWidth = wid >= 908 ? 808 : wid - (100 * wid / 908);
        dialogConfig.width = modalWidth + 'px';
        dialogConfig.maxWidth = modalWidth + 'px';
        dialogConfig.height = this.winRef.nativeWindow.innerHeight + 'px';
        if (!this.service.newzes$.has(news.id)) { this.service.newzes$.set(news.id, news); }
        // When router navigates on this component is takes the params and opens up the photo detail modal
        dialogConfig.data = {news$: news, color: 'whitesmoke', header$: modalWidth - 24};
        dialogConfig.autoFocus = false;
        this.currentDialog = this.modalService.open(NewsDetailsComponent, dialogConfig);
        // Go back to home page after the modal is closed
        this.currentDialog.afterClosed().pipe(takeUntil(this.destroy)).subscribe(result => {
            if (result && result !== '') {
              this.router.navigateByUrl(result, {state: {userID: news.ownerId}});
            } else { this.location.back(); }
          });
    });
  }
  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
