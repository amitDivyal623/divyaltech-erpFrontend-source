import { Component, DefaultIterableDiffer, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppComponent } from '../../app.component';
import Swal from 'sweetalert2';
import { LoginSignupService } from '../../services/login-signup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { dateFormatNames } from '@progress/kendo-angular-intl';
import { environment } from 'src/environments/environment';
// import { format } from 'path';
import { UserActivityService } from '../../services/user-activity.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  updated_dt: any;
  current_date: any;
  days: number;

  constructor(private route: Router, private loginService: LoginSignupService, private AppComponents: AppComponent, private spinner: NgxSpinnerService, private activityService: UserActivityService) {
    //if(sessionStorage.getItem('token')!=undefined && sessionStorage.getItem('UserName')!=undefined){
    //this.route.navigate(['dashboard']);
    //}
  }
  resp: any;
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    pass: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    // this.spinner.show();
    // setTimeout(() => {
    //   this.spinner.hide();
    // }, 500);
    // setTimeout(() => {
    //   this.Logout();
    // }, 5000); // 5000 milliseconds = 5 seconds
  }

  // Logout() {
  // 	sessionStorage.removeItem('UserName');
  // 	sessionStorage.removeItem('CompanyId');
  // 	sessionStorage.removeItem('UserRole');
  // 	sessionStorage.removeItem('UserId');
  // 	sessionStorage.removeItem('token');
  // 	this.route.navigate(['/']);
  // }
  login() {

    if (this.loginForm.valid) {
      this.spinner.show();
      let loginData = new FormData();
      loginData.append('username', this.loginForm.get('username')?.value);
      loginData.append('password', this.loginForm.get('pass')?.value);

      this.loginService.user_login(loginData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        let responseData = Response;
        console.log(Response);
        if (typeof responseData.CODE !== "undefined" && responseData.CODE === 200) {
          sessionStorage.setItem('UserName', responseData.USERNAME);
          sessionStorage.setItem('UserRole', responseData.USERROLE);
          // sessionStorage.setItem('UserRoleID',responseData.ROLEID);
          sessionStorage.setItem('token', Response.TOKEN);
          sessionStorage.setItem('UPDATEDDT', Response.UPDATEDDT);
          sessionStorage.setItem('EMPLOYEEID', Response.EMPLOYEEID);
          sessionStorage.setItem('COMPANY_NAME', Response.COMPANYNAME);
          this.updated_dt = Response.UPDATEDDT;


          if (responseData.USERROLE[0] != 'Admin' && !environment.bypassOTP) { // (responseData.USERROLE[0] != 'Admin' && !environment.bypassOTP)

            let sendData = new FormData();

            sendData.append('UserId', Response.USERID);

            this.loginService.send_otp_email(sendData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

            });


            // Initial OTP Sent notification
            Swal.fire({
              title: 'OTP Sent!',
              text: 'An OTP has been sent to your email.',
              icon: 'success',
              showConfirmButton: false,
              timer: 3000
            }).then(() => {

              // Function to show OTP input pop-up
              const showOtpPrompt = () => {
                Swal.fire({
                  title: 'Enter 4-digit OTP',
                  html: '<p>Sent to your registered email</p>',
                  input: 'text',
                  inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                  },
                  showCancelButton: true,
                  confirmButtonText: 'Submit',
                  cancelButtonText: 'Cancel',
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  focusConfirm: false,
                  inputValidator: (value) => {
                    if (!value) {
                      return 'Please enter OTP!';
                    }
                    if (!/^\d{4}$/.test(value)) {
                      return 'OTP must be a 4-digit number!';
                    }
                  }
                }).then((result) => {
                  if (result.isConfirmed) {
                    const otp = result.value;

                    // Proceed for OTP verification
                    this.spinner.show();
                    let optvalue = new FormData();

                    optvalue.append('UserId', Response.USERID);
                    optvalue.append('otp', otp);

                    this.loginService.verify_otp(optvalue).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                      console.log(resp);
                      if (resp.valid) {
                        this.spinner.hide();
                        Swal.fire({
                          title: 'Success!',
                          text: 'OTP verified successfully.',
                          icon: 'success',
                          showConfirmButton: false,
                          timer: 2000
                        }).then(() => {
                          this.activityService.logActivity('LOGIN', 'Auth', 'OTP Verified');
                          this.route.navigate(['dashboard']);
                        });
                      } else {
                        this.spinner.hide();
                        Swal.fire({
                          title: 'Failure!',
                          text: 'OTP verification failed. Please try again.',
                          icon: 'error',
                          showConfirmButton: false,
                          timer: 3000
                        }).then(() => {


                          // Show OTP prompt again if the OTP verification fails
                          showOtpPrompt();
                        })


                      }
                    });
                  }
                });
              };

              // Initial call to show OTP prompt
              showOtpPrompt();

            });





          }
          else {
            if (this.updated_dt >= 30) {
              this.activityService.logActivity('LOGIN', 'Auth', 'Reset Password');
              this.route.navigate(['reset-password']);
            } else {
              this.activityService.logActivity('LOGIN', 'Auth', 'Standard Login');
              this.route.navigate(['dashboard']);
            }
            this.spinner.hide();
          }

          this.spinner.hide();
        } else if (responseData.CODE == 400) {
          Swal.fire({
            icon: 'error',
            title: 'Time limit exceed',
            text: 'Please contact your admin',
            showConfirmButton: false,
            timer: 3000
          });
          this.spinner.hide();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Id/Password!',
            text: 'Enter valid Email and Password',
            showConfirmButton: false,
            timer: 3000
          });
          this.spinner.hide();
        }
      });
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Field required!',
        text: 'Please enter Email and Password to login',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  forgotPass(): void {

    // this.route.navigate(['forgot-password']);
    this.route.navigate(['forgot-password']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


