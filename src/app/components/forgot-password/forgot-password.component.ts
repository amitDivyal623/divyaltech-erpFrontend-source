import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginSignupService } from 'src/app/services/login-signup.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  emailForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  resetForm = new FormGroup({
    otp: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    cpassword: new FormControl('', Validators.required)
  });

  otpSent = false;
  submittedEmail: string;

  constructor(private route: Router, private spinner: NgxSpinnerService, private loginService: LoginSignupService) { }

  ngOnInit(): void {
  }

  sendRequest(): void {

    if (this.emailForm.valid) {
      this.spinner.show();
      this.submittedEmail = this.emailForm.get('email')?.value;

      let emailData = new FormData();
      emailData.append('email', this.submittedEmail);

      this.loginService.user_email_verify(emailData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        this.spinner.hide();
        this.otpSent = true;

        Swal.fire({
          icon: 'success',
          title: 'Check your email',
          html: `
            <div>If that email is registered, a verification code has been sent to it.</div>
            <div style="margin-top: 10px;">Enter the code below along with your new password.</div>
          `,
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      }, () => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: 'Please try again in a moment.',
          showConfirmButton: false,
          timer: 3000
        });
      });
    }
  }

  resetPassword(): void {

    if (!this.resetForm.valid) {
      Swal.fire('Alert', 'Fill all required fields first', 'info');
      return;
    }

    if (this.resetForm.get('password')?.value !== this.resetForm.get('cpassword')?.value) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: "Password and confirm password don't match",
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    this.spinner.show();
    let resetData = new FormData();
    resetData.append('email', this.submittedEmail);
    resetData.append('otp', this.resetForm.get('otp')?.value);
    resetData.append('password', this.resetForm.get('password')?.value);

    this.loginService.reset_password_with_otp(resetData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.spinner.hide();

      if (Response.CODE == 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your password has been reset. Please log in.',
          showConfirmButton: false,
          timer: 2500
        }).then(() => {
          this.route.navigate(['/']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Invalid or expired code. Please try again.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    }, () => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'Please try again in a moment.',
        showConfirmButton: false,
        timer: 3000
      });
    });
  }

  goBack(): void {
    this.route.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
