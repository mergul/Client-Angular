import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../core/auth.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {matchingPasswords} from './validators';
import {Observable, of} from 'rxjs';
import {Location} from '@angular/common';
import {UserService} from '../core/user.service';
import {FirebaseUserModel} from '../core/user.model';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {

    registerForm: FormGroup;
    errorMessage = '';
    successMessage = '';
    showModal: Observable<boolean> = of(false);
    listenerFn: () => void;

    constructor(
        public authService: AuthService,
        public userService: UserService,
        private router: Router,
        private location: Location,
        private fb: FormBuilder
    ) {
        this.createForm();
    }
ngOnInit(): void {
}

    createForm() {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            password2: ['', Validators.required],
            sozlesme: [false, Validators.requiredTrue]
        }, {validator: matchingPasswords('password', 'password2')});
    }
    isFieldValid(field: string) {
        return !this.registerForm.get(field).valid && this.registerForm.get(field).touched;
    }
    tryFacebookLogin() {
        this.authService.doFacebookLogin(false)
            .then(res => {
                    this.router.navigate(['/user']);
                }, err => console.log(err)
            );
    }

    tryTwitterLogin() {
        this.authService.doTwitterLogin()
            .then(res => {
                    this.router.navigate(['/user']);
                }, err => console.log(err)
            );
    }

    tryGoogleLogin() {
        this.authService.doGoogleLogin(false)
            .then(res => {
                    this.router.navigate(['/user']);
                }, err => console.log(err)
            );
    }

    tryRegister(value) {
        this.authService.doRegister(value)
            .then(res => {
                res.sendEmailVerification( {
                    'url': 'http://localhost:4200/auth', // Here we redirect back to this same page.
                    'handleCodeInApp': true // This must be true.
                }).then(value1 => {
                    alert('Verification Email Sent! Check yor email please!');
                    setTimeout(
                        () => this.router.navigate(['/']),
                        100
                    );
                });
                res.updateProfile({
                    displayName: value.name,
                    photoURL: ''
                }).then(function() {
                    // Update successful.
                }, function(error) {
                    // An error happened.
                });
                    const fg = new FirebaseUserModel();
                    fg.token = res['ra'];
                    fg.email = res.email;
                    fg.id = res.uid;
                    fg.provider = 'auth';
                    fg.name = value.name;
                    this.userService.loggedUser = fg;
                    this.errorMessage = '';
                    this.successMessage = 'Your account has been created';
            }, err => {
                console.log(err);
                this.errorMessage = err.message;
                this.successMessage = '';
            });
    }
    ngAfterViewInit() {
        this.showModal = of(true);
    }

    onClose() {
        this.showModal = of(false);
        // Allow fade out animation to play before navigating back
        setTimeout(
            () => this.location.back(), // this.router.navigate(['/']),
            100
        );
    }

    onDialogClick(event: UIEvent) {
        // Capture click on dialog and prevent it from bubbling to the modal background.
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
    }
}
