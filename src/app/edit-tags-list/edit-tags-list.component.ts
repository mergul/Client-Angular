import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {User} from '../core/user.model';
import {UserService} from '../core/user.service';
import { takeUntil } from 'rxjs/operators';
import { ReactiveStreamsService } from '../core/reactive-streams.service';

@Component({
  selector: 'app-edit-tags-list',
  templateUrl: './edit-tags-list.component.html',
  styleUrls: ['./edit-tags-list.component.scss']
})
export class EditTagsListComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();
  private _isPub: Observable<boolean>;
  _tags: Observable<Array<string>>;
  private _booled: boolean;

  constructor(private service: UserService, private reactiveService: ReactiveStreamsService) { }

  @Input()
  get tags(): Observable<Array<string>> {
    return this._tags;
  }

  set tags(value: Observable<Array<string>>) {
    this._tags = value;
  }
  @Input()
  get booled(): boolean {
    return this._booled;
  }

  set booled(value: boolean) {
    this._booled = value;
  }
  @Input()
  get isPub(): Observable<boolean> {
    return this._isPub;
  }

  set isPub(value: Observable<boolean>) {
    this._isPub = value;
  }

  ngOnInit() {
  }
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
  removeTag(tag: string) {
    this.service.dbUser.tags.splice(this.service.dbUser.tags.indexOf(tag), 1);
    this.service.newsCo.get(this.service.links[1]).splice(this.service.dbUser.tags.indexOf(tag), 1);
   // this.reactiveService.resetUserListListeners('#' + tag);
    this.service.manageFollowingTag('#' + tag, false).pipe(takeUntil(this.onDestroy)).subscribe();
  }
  addTag(tag: string) {
    this.service.dbUser.tags.push(tag);
    this.service.newsCo.get(this.service.links[1]).push(tag);
    // this.reactiveService.setUserListListeners('#' + tag);
    this.service.manageFollowingTag('#' + tag, true).pipe(takeUntil(this.onDestroy)).subscribe();
  }
}
