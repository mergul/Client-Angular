import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

import {
  NgbdModal1ContentComponent,
  NgbdModalStackedComponent
} from './modal-stacked';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, NgbModule, ReactiveFormsModule],
  declarations: [NgbdModalStackedComponent, NgbdModal1ContentComponent],
  exports: [NgbdModalStackedComponent],
  bootstrap: [NgbdModalStackedComponent],
  entryComponents: [NgbdModal1ContentComponent]
})
export class StackedModalModule { }
