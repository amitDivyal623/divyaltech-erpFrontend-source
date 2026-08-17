import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from 'src/app/services/company.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  submitted: boolean;
  ResetPasswordForm = new FormGroup({
    oldpassword: new FormControl('',Validators.required),
		password: new FormControl('',Validators.required),
		cpassword: new FormControl('',Validators.required)
	});
  password: any;
  cpassword: any;
  oldpassword: any;
  token_reset: string;

  constructor(private companyService: CompanyService, private route: Router) {
    //if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      //this.route.navigate(['/']);
    //} else if (parseInt(sessionStorage.getItem('UPDATEDDT')) <= 30) {
      //this.route.navigate(['/dashboard']);
    //}
  }

  ngOnInit(): void {

    }
  resetpassword() {
		if(this.ResetPasswordForm.valid){
			this.submitted = false;
			if(this.ResetPasswordForm.get('password').value == this.ResetPasswordForm.get('cpassword').value ) {
        let userData = new FormData();
        userData.append('oldpassword',this.ResetPasswordForm.get('oldpassword').value);
				userData.append('password',this.ResetPasswordForm.get('password').value);
        this.companyService.resetPasswordWithin30days(userData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          
					if (Response.CODE == 200) {
						Swal.fire({
							icon:'success',
							title:'Success!',
							text:Response.MESSAGE,
							showConfirmButton:false,
							timer:2000
            });
            this.route.navigate(['/']);
						//this.closeModal();
					}else{
						Swal.fire({
							icon:'error',
							title:'Error!',
							text:'Old password Does not match',
							showConfirmButton:false,
							timer:3000
						});
					}
				});
			}else{
				//this.closeModal();
				Swal.fire({
					icon:'error',
					title:'Error!',
					text:"Password and confirm password doesn't match",
					showConfirmButton:false,
					timer:3000
				  });
			}

		}else{
			this.submitted = true;
			Swal.fire('Alert','Fill all required fields first','info');
		}
	}
  reset() {

    this.ResetPasswordForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
