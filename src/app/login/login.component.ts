import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../core/auth.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {Location} from '@angular/common';
import {MediaMatcher} from '@angular/cdk/layout';

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
    showModal: Observable<boolean> = of(false);
    listenerFn: () => void;
    private _mobileQueryListener: () => void;
    mobileQuery: MediaQueryList;

    constructor(
        private authService: AuthService,
        private router: Router,
        private location: Location,
        private fb: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef, private media: MediaMatcher
    ) {
        this.createForm();
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit() {
      //  const url = window.location.href;
      //  this.confirmSignIn(url);
    }
    createForm() {
        this.loginForm = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    tryFacebookLogin() {
        this.authService.doFacebookLogin(this.mobileQuery.matches)
            .then(res => {
                this.authService.redirectUrl !== 'login' ? this.router.navigate(['/loginin']) :
                    this.router.navigate(['/user']);
            });
    }

    tryTwitterLogin() {
        this.authService.doTwitterLogin()
            .then(res => {
                this.authService.redirectUrl !== 'login' ? this.router.navigate(['/loginin']) :
                    this.router.navigate(['/user']);
            });
    }

    tryGoogleLogin() {
        this.authService.doGoogleLogin(this.mobileQuery.matches)
            .then(res => {
                this.authService.redirectUrl !== 'login' ? this.router.navigate(['/loginin']) :
                this.router.navigate(['/user']);
            });
    }

    tryLogin(value) {
        this.authService.doLogin(value)
            .then(res => {
                this.authService.redirectUrl !== 'login' ? this.router.navigate(['/loginin']) :
                    this.router.navigate(['/user']);
            }, err => {
              //  console.log(err);
                this.errorMessage = err.message;
            });
    }

    tryAnonymousLogin() {
        this.authService.doAnonimousLogin()
            .then(res => {
                this.authService.redirectUrl !== 'login' ? this.router.navigate(['/loginin']) :
                    this.router.navigate(['/user']);
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
    isValidMailFormat() {
        const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        if ((this.loginForm.controls.email.value.toString().length === 0) && (!EMAIL_REGEXP.test(this.loginForm.controls.email.value))) {
            return false;
        }

        return true;
    }
    ngAfterViewInit() {
        this.showModal = of(true);
    }

    onClose() {
        this.showModal = of(false);
        setTimeout(
            () => this.location.back(), // this.router.navigate(['/']),
            100
        );
    }

    onDialogClick(event: UIEvent) {
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
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
