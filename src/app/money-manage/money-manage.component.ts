import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { NewsService } from '../core/news.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';


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
  constructor(private fb: FormBuilder, private newsService: NewsService, private _snackBar: MatSnackBar) { }

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
          console.log('Money Partition request finished and returned!!!');
      });
      this._snackBar.open('Your request sent successfully!', 'Check results!', {
        duration: 3000,
      });
      this.searchField.patchValue(0);
    }
  }

}
