// import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
// import {FormBuilder, FormGroup, Validators} from '@angular/forms';
// import {Observable, of} from 'rxjs';
// import {AuthService} from '../core/auth.service';
// import {Router} from '@angular/router';
// import {Location} from '@angular/common';

// @Component({
//   selector: 'app-pre-login',
//   templateUrl: './pre-login.component.html',
//   styleUrls: ['../login/login.scss']
// })
// export class PreLoginComponent implements OnDestroy, AfterViewInit {

//   loginForm: FormGroup;
//   errorMessage = '';
//   error: {name: string, message: string} = {name: '', message: ''};
//   email = '';
//   resetPassword = false;
//   showModal: Observable<boolean> = of(false);
//   listenerFn: () => void;

//   constructor(
//       private authService: AuthService,
//       private router: Router,
//       private location: Location,
//       private fb: FormBuilder
//   ) {
//     this.createForm();
//   }

//   createForm() {
//     this.loginForm = this.fb.group({
//       email: ['', Validators.required],
//       password: ['', Validators.required]
//     });
//   }

//   tryLogin(value) {
//     this.authService.doPreLogin(value)
//         .then(res => {
//             this.router.navigate([this.authService.redirectUrl]);
//           this.authService.redirectUrl = 'login';
//             return res;
//         }, err => {
//          // console.log(err);
//           this.errorMessage = err.message;
//         });
//   }
//   clearErrorMessage() {
//     this.errorMessage = '';
//     this.error = {name: '', message: ''};
//   }
//   isValidMailFormat(email: string) {
//     const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

//     if ((email.length === 0) && (!EMAIL_REGEXP.test(email))) {
//       return false;
//     }

//     return true;
//   }
//   ngAfterViewInit() {
//     this.showModal = of(true);
//   }

//   onClose() {
//     this.showModal = of(false);
//     // Allow fade out animation to play before navigating back
//     setTimeout(
//         () =>  this.router.navigate(['prelogin/']),
//         100
//     );
//   }

//   onDialogClick(event: UIEvent) {
//     // Capture click on dialog and prevent it from bubbling to the modal background.
//     event.stopPropagation();
//     event.cancelBubble = true;
//   }

//   ngOnDestroy() {
//     if (this.listenerFn) {
//       this.listenerFn();
//     }
//   }
// }
