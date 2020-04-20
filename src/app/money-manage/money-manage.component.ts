import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { NewsService } from '../core/news.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-money-manage',
  templateUrl: './money-manage.component.html',
  styleUrls: ['./money-manage.component.scss']
})
export class MoneyManageComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();
  adListStyle = {};
  searchField: FormControl;
  searchForm: FormGroup;
  constructor(private fb: FormBuilder, private newsService: NewsService) { }

  ngOnInit() {
    this.searchForm = this.fb.group({});
    this.searchField = new FormControl();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
  partitionMoney(value: number) {
    if (!value || value === 0) {
      alert('Hatalı İşlem!');
    } else {
      this.newsService.partitionMoney(value).pipe(takeUntil(this.onDestroy)).subscribe(() => {
        this.searchField.patchValue(0);
        // setTimeout(
        //   () => this.newsService.setStoreValues().pipe(takeUntil(this.onDestroy)).subscribe(() => {
        //     alert('İşlem başarıyla tamamlandı!');
        //   }),
        //   5000
        // );
      });
    }
  }

}
