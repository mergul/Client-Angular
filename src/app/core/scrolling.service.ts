import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollingService {

  scrollY = new BehaviorSubject(0);
  scrollY$ = this.scrollY.asObservable();

  constructor() {
  }

  updateScrollY(value: number): void {
    this.scrollY.next(value);
  }}
