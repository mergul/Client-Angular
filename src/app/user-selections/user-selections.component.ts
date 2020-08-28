import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {UserService} from '../core/user.service';
import {map, takeUntil} from 'rxjs/operators';
import {Observable, of, Subject} from 'rxjs';
import {BalanceRecord} from '../core/user.model';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatListOption, MatSelectionList, MatSelectionListChange} from '@angular/material/list';

@Component({
  selector: 'app-user-selections',
  templateUrl: './user-selections.component.html',
  styleUrls: ['./user-selections.component.scss']
})
export class UserSelectionsComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();
  userList: Observable<Array<BalanceRecord>>;
  selectedList: Array<BalanceRecord>;
  idList = [];
  _selected: MatListOption[];
  clientForm: FormGroup;

  @ViewChild('users', {static: false}) private users: MatSelectionList;
  constructor( private service: UserService, private fb: FormBuilder) {
    this.clientForm = this.fb.group( {
      myOtherControl: new FormControl([])
    });
  }

  ngOnInit() {
    this.userList = this.service.hotBalanceRecords().pipe(map(value => value));
  }

  onSelection($event: MatSelectionListChange, selected: MatListOption[]) {
    this._selected = $event.option.value;
  }

  deselectusers() {
    this.users.deselectAll();
  }

  payMe() {
    this.selectedList = this.clientForm.controls.myOtherControl.value;
    this.selectedList.forEach(value => {
      this.idList.push(value.key);
    });
    this.service.payToAll(this.idList).pipe(takeUntil(this.onDestroy)).subscribe(value => {
      this.userList = this.userList.pipe(
          map(value1 => value1.filter(previousValue => !this.idList.includes(previousValue.key))));
      // setTimeout(
      //     () =>  this.newsService.setStoreValues().pipe(takeUntil(this.onDestroy)).subscribe(value1 => {
      //       alert('İşlem başarıyla tamamlandı!');
      //     }),
      //     5000
      // );
    });
  }

  selectallusers() {
    this.users.selectAll();
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
