import {AfterViewInit, Component, OnDestroy, OnInit, Inject, Renderer2, HostListener} from '@angular/core';
import {AuthService} from '../core/auth.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { NewsService } from '../core/news.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { UserService } from '../core/user.service';
import { FirebaseUserModel } from '../core/user.model';
import { of } from 'rxjs';

@Component({
    selector: 'app-page-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

    loginForm: FormGroup;
    errorMessage = '';
    error: {name: string, message: string} = {name: '', message: ''};
    email = '';
    resetPassword = false;
    listenerFn: () => void;
    color: string;
    wideStyle: { width: string; };
    id: any;
    EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    isValidMailFormat = of(false);

    constructor(
        private authService: AuthService, private newsService: NewsService,
        private fb: FormBuilder, public dialogRef: MatDialogRef<LoginComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
        @Inject(DOCUMENT) private _document: Document, private reactiveService: ReactiveStreamsService,
        private renderer: Renderer2, public userService: UserService
    ) {
        this.createForm();
        this.color = data.color;
    }

    ngOnInit() {
        const modalWidth = this.data.header$;
        this.wideStyle = {
            width: `${modalWidth}px`
        };
      //  const url = window.location.href;
      //  this.confirmSignIn(url);
      this.isValidMailFormat = of((this.loginForm.controls.email.value.toString().length === 0) &&
      (!this.EMAIL_REGEXP.test(this.loginForm.controls.email.value)));
    }
    @HostListener('window:keyup.esc') onKeyUp() {
        this.dialogRef.close();
    }
    createForm() {
        this.loginForm = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });
    }
    setUser = (user) => {
        const kuser = new FirebaseUserModel();
        kuser.id = user.user.uid;
        kuser.email = user.user.providerData[0].email;
        kuser.name = user.displayName;
        this.userService.loggedUser = kuser;
    }
    tryFacebookLogin() {
        this.authService.doFacebookLogin(this.data.header$ < 600)
            .then((user) => {
                this.setUser(user);
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
            });
    }

    tryTwitterLogin() {
        this.authService.doTwitterLogin()
            .then((user) => {
                this.setUser(user);
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
            });
    }

    tryGoogleLogin() {
        this.authService.doGoogleLogin(this.data.header$ < 600)
            .then((user) => {
                if (this.userService.redirectUrl === '/home') {
                    this.setUser(user);
        // this.reactiveService.setListeners('@' + Array.prototype.slice.call(([...Buffer.from(user.user.uid.substring(0, 12))]))
                    // .map(this.userService.hex.bind(this, 2)).join(''));
                }
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
            });
    }

    tryLogin(value) {
        this.authService.doLogin(value)
            .then((user) => {
                this.setUser(user);
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                this.onClose('user');
            }, err => {
              //  console.log(err);
                this.errorMessage = err.message;
            });
    }

    tryAnonymousLogin() {
        this.authService.doAnonimousLogin()
            .then((user) => {
                this.setUser(user);
                this.userService.redirectUrl !== 'login' ? this.onClose(this.userService.redirectUrl) :
                    this.onClose('user');
            });
    }
    sendResetEmail() {
        this.clearErrorMessage();

        this.authService.resetPassword(this.loginForm.controls.email.value)
            .then(() => this.resetPassword = true)
            .catch(_error => {
                this.error = _error;
            });
    }
    clearErrorMessage() {
        this.errorMessage = '';
        this.error = {name: '', message: ''};
    }

    ngAfterViewInit() {
       // setTimeout(() => {
            this.renderer.setStyle(this._document.querySelector('.mat-dialog-container'), 'background-color', this.color);
       // });
    }

    onClose(redir: string) {
        //   this.renderer.setStyle(this._document.querySelector('.mat-dialog-container'), 'background-color', 'transparent');
        if (redir === 'home') {
            this.newsService.activeLink = 'En Çok Okunanlar';
            this.dialogRef.close(redir);
        }
        this.dialogRef.close(redir);
    }

    onDialogClick(event: UIEvent) {
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
    }

    // private confirmSignIn(url: string) {
    //     const email = window.localStorage.getItem('emailForSignIn');
    //     this.authService.doLinkLogin(email, url).then(value => {
    //         return value;
    //     }).then(value => value);
    // }
}
