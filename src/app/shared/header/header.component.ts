import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HrService } from 'src/app/services/hr.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
	// Collapse states
	public isHRCollapsed = false;
	public isAdnCollapsed = false;
	public isProdCollapsed = false;
	public isPrjCollapsed = false;
	public isStcCollapsed = false;
	public isCRMCollapsed = false;
	public isActCollapsed = false;
	public isRptCollapsed = false;
	public isSlsCollapsed = false;
	public isPchsCollapsed = false;
	public isAdmCollapsed = false;
	public isSalaryCollapsed = false;
	public isAttendanceCollapsed = false;
	public isRADCollapsed = false;
	public isReportCollapsed = false;

	// Role booleans (logic unchanged)
	hradminTab = false;
	hrUserTab = false;
	Admin = false;
	employeeTab = false;
	Administrator = false;
	Accountant = false;
	Accounts_Internal = false;
	CRMAdmin = false;
	CRMUser = false;
	sysAdmin = false;
	projectManager = false;
	productManager = false;
	projectCoordinator = false;
	projectSubCoordinator = false;
	salesRecord = false;
	private destroy$ = new Subject<void>();

	constructor(private router: Router, private hrservice: HrService) { }

	// Navigation helper
	route(link: string) {
		this.router.navigate(['/' + link]);
	}

	// Helper to simplify long OR conditions in HTML
	hasAny(...roles: boolean[]): boolean {
		return roles.some(r => r === true);
	}

	ngOnInit(): void {

		const roleString = sessionStorage.getItem('UserRole') || '';
		const match = roleString.split(',');

		// Safe iteration (improved from for-in)
		for (const roleRaw of match) {
			const role = roleRaw.trim();

			if (role === 'HR Admin') this.hradminTab = true;
			if (role === 'HR user') this.hrUserTab = true;
			if (role === 'Admin') this.Admin = true;
			if (role === 'Employee') this.employeeTab = true;
			if (role === 'SystemAccess') this.sysAdmin = true;
			if (role === 'Administrator') this.Administrator = true;
			if (role === 'Accountant') this.Accountant = true;
			if (role === 'Accounts Internal') this.Accounts_Internal = true;
			if (role === 'Project Manager') this.projectManager = true;
			if (role === 'Product Manager') this.productManager = true;
			if (role === 'CRM Admin') this.CRMAdmin = true;
			if (role === 'CRM User') this.CRMUser = true;
			if (role === 'Project Coordinator') this.projectCoordinator = true;
			if (role === 'Project Sub-Coordinator') this.projectSubCoordinator = true;
			if (role === 'Sales Record') this.salesRecord = true;
		}

		this.updateCollapsedSections(this.router.url);
		this.router.events
			.pipe(
				filter((event): event is NavigationEnd => event instanceof NavigationEnd),
				takeUntil(this.destroy$)
			)
			.subscribe((event) => this.updateCollapsedSections(event.urlAfterRedirects));
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	route_wabridge(link: string): void {
		if (link === 'wabridge-page') {
			window.open('https://web.wabridge.com/login', '_blank');
		}
	}

	get poPrLabel(): string {
		if (this.projectCoordinator && !this.projectManager) {
			return 'PR';
		}
		return 'PO / PR';
	}

	private updateCollapsedSections(url: string): void {
		const parsedUrl = this.router.parseUrl(url);
		const menuSource = parsedUrl.queryParams['menuSource'];
		const isStockPurchaseFlow = menuSource === 'stock'
			&& (url.includes('purchase-order') || url.includes('add-purchase-order'));
		const isRegistryBookingFlow = this.isRegistryBookingFlow(url);
		const isProductFlow = this.isProductFlow(url);

		this.isHRCollapsed = url.includes('hr-');
		this.isCRMCollapsed = url.includes('crm-');
		this.isPrjCollapsed = url.includes('project-');
		this.isStcCollapsed = url.includes('stock-') || isStockPurchaseFlow;
		this.isProdCollapsed = isProductFlow;
		this.isActCollapsed = url.includes('account-');
		this.isAdnCollapsed = url.includes('admin-') || url.includes('warehouse');
		this.isRptCollapsed = url.includes('report-');
		this.isPchsCollapsed = url.includes('purchase-') && !isStockPurchaseFlow;
		this.isRADCollapsed = isRegistryBookingFlow;
	}

	private isProductFlow(url: string): boolean {
		return url.includes('product-')
			|| url.includes('add-product')
			|| url.includes('settings');
	}

	private isRegistryBookingFlow(url: string): boolean {
		return url.includes('reg-')
			|| url.includes('edit-booking')
			|| url.includes('add-booking-registry')
			|| url.includes('edit-view-registry')
			|| url.includes('pdf-regbooking');
	}

}
