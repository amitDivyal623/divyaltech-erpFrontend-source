import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyService } from '../../services/company.service';
import { AdminService } from 'src/app/services/admin.service';
import { NotificationService } from 'src/app/services/notification.service';


@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

	private destroy$ = new Subject<void>();
	@ViewChild('closebutton') closebutton;
	@ViewChild('openmodal') openmodal;
	submitted: boolean;
	followupCount: number = 0;
	qtyNotRecievedCount: number = 0;
	incompleteReadingCount: number = 0;
	totalNotificationCount: number = 0;
	fromDate: any;
	toDate: any;

	addNewPassword = new FormGroup({
		password: new FormControl('', Validators.required),
		cpassword: new FormControl('', Validators.required)
	});


	profile = "Profile";
	constructor(private companyService: CompanyService, private route: Router, private adminService: AdminService, private notificationService: NotificationService) { }

	ngOnInit(): void {
		if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined || sessionStorage.length === 0) {
			this.Logout();
		} else {
			this.profile = sessionStorage.getItem('UserName');
		}
		this.getAllNotificationDetails();

		this.notificationService.refreshFollowup$.pipe(takeUntil(this.destroy$)).subscribe(() => { this.getAllNotificationDetails(); });
	}

	getAllNotificationDetails() {
		this.adminService.getAllNotificationDetails(new FormData()).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.followupCount = Number(resp.MissedfollowUps[0].total_tasks || 0);
			this.fromDate = resp.MissedfollowUps[0].from_date;
			this.toDate = resp.MissedfollowUps[0].to_date;

			this.qtyNotRecievedCount = Number(resp.QtyNotReceived[0].total_count || 0);

			this.incompleteReadingCount = Number(resp.incompleteReadingCount[0].total_count || 0);

			// Total notification count
			this.totalNotificationCount =
				this.followupCount +
				this.qtyNotRecievedCount +
				this.incompleteReadingCount;
		});
	}

	toggleClick() {
		console.log('colapseing ')
		if ($('#slide-out').hasClass('slim')) {
			$('#slide-out').removeClass('slim');
			$('.sv-slim-icon').removeClass('fa-angle-double-right').addClass('fa-angle-double-left');
			$('.fixed-sn .double-nav').css({
				'transition': 'all .3s ease-in-out',
				'padding-left': '0'
			});
			$('.fixed-sn main').css({
				'transition': 'all .3s ease-in-out',
				'padding-left': '0'
			});
			$('.fixed-sn footer').css({
				'transition': 'all .3s ease-in-out',
				'padding-left': '15rem'
			});
		} else {
			$('#slide-out').addClass('slim');
			$('.sv-slim-icon').removeClass('fa-angle-double-left').addClass('fa-angle-double-right');
			$('.fixed-sn .double-nav').css('padding-left', '13.5rem');
			$('.fixed-sn main').css('padding-left', '13.5rem');
			$('.fixed-sn footer').css('padding-left', '13.5rem');
		}
	}
	Logout() {
		sessionStorage.removeItem('UserName');
		sessionStorage.removeItem('CompanyId');
		sessionStorage.removeItem('UserRole');
		sessionStorage.removeItem('UserId');
		sessionStorage.removeItem('token');
		this.route.navigate(['/']);
	}

	resetpassword() {
		if (this.addNewPassword.valid) {
			this.submitted = false;
			if (this.addNewPassword.get('password')?.value == this.addNewPassword.get('cpassword')?.value) {
				let customerData = new FormData();
				customerData.append('password', this.addNewPassword.get('password')?.value);
				this.companyService.resetPassword(customerData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
					if (Response.CODE == 200) {
						Swal.fire({
							icon: 'success',
							title: 'Success!',
							text: Response.MESSAGE,
							showConfirmButton: false,
							timer: 2000
						});
						this.closeModal();
					} else {
						Swal.fire({
							icon: 'error',
							title: 'Error!',
							text: 'Password updation failed',
							showConfirmButton: false,
							timer: 3000
						});
					}
				});
			} else {
				this.closeModal();
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: "Password and confirm password doesn't match",
					showConfirmButton: false,
					timer: 3000
				});
			}

		} else {
			this.submitted = true;
			Swal.fire('Alert', 'Fill all required fields first', 'info');
		}
	}

	goToTaskManagement() {
		this.route.navigate(['/crm-task'], { queryParams: { fromDate: this.fromDate, toDate: this.toDate } });

	}

	goToRentGatePass() {
		this.route.navigate(['/stock-gate-pass'], { queryParams: { tab: 'rentItemGatePass' } });
	}

	goToIncompleteMachineReading() {
		this.route.navigate(['/stock-gate-pass'], { queryParams: { tab: 'machinereading' } });
	}

	public closeModal() {
		this.closebutton.nativeElement.click();
	}

	public openresetmodal() {
		this.addNewPassword.reset();
		this.openmodal.nativeElement.click();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
