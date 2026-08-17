import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment, UrlMatchResult } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AddBookingRegistryComponent } from './shared/add-booking-registry/add-booking-registry.component';
import { RegistrybookingPdfComponent } from './registrybooking-pdf/registrybooking-pdf.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { AddRegistryComponent } from './booking-registry/add-registry/add-registry.component';
// import { ModalsComponent } from './modals/modals.component';

/**
 * All 13 feature modules are lazy-loaded under an effectively-empty parent path (to keep
 * their existing flat URLs, e.g. `/hr-attendance` not `/hr/hr-attendance`). A plain
 * `path: ''` on every one of them would make the Router try each `loadChildren` entry in
 * array order — and since `path: ''` always "locally matches", the Router must actually
 * dynamically `import()` (i.e. download) each candidate module just to check whether ITS
 * internal routes match the rest of the URL, before moving to the next candidate. That
 * means navigating to a route owned by the module registered *last* in this list would
 * silently download every other module's chunk first.
 *
 * `matcher` fixes this: it runs synchronously against the URL segments with zero network
 * cost, so the Router can identify the single correct module up front and only download
 * that one chunk. The literal path lists below are mechanically extracted from each
 * module's own `-routing.module.ts` (first path segment only — sufficient even for
 * parameterized routes like `hr-task-details/:id/:method`, since the first segment is
 * always the fixed literal).
 */
function pathMatcher(paths: string[]) {
  const pathSet = new Set(paths);
  return (segments: UrlSegment[]): UrlMatchResult | null => {
    if (segments.length > 0 && pathSet.has(segments[0].path)) {
      return { consumed: [] };
    }
    return null;
  };
}

const REPORT_PATHS = ['report-attendance', 'report-booking', 'report-enquiry', 'report-expense', 'report-projects', 'report-user-activity-logs'];
const FILE_MGMT_PATHS = ['file-mgmt'];
const SALE_PATHS = ['add-project', 'add-property-sale', 'add-sale-order', 'edit-project', 'edit-property-sale', 'edit-sale-order', 'product-sale', 'sale-booking', 'sale-order', 'sale-property', 'view-project', 'view-property-sale', 'view-sale-order'];
const ADMINISTRATION_PATHS = ['admin-administration-role', 'admin-administration-users', 'administration-company-info'];
const PURCHASE_PATHS = ['add-purchase-order', 'product-purchase', 'purchase-expense', 'purchase-material', 'purchase-order', 'purchase-property', 'purchase-propinfo', 'purchase-seller'];
const PRODUCT_PATHS = ['add-product', 'product-Details', 'product-item-master', 'product-master', 'product-stock', 'settings'];
const ACCOUNT_PATHS = ['account-accountant', 'account-bank-accounts', 'account-billing', 'account-contractorDetails', 'account-transaction', 'account-vendordetails'];
const ADMIN_PATHS = ['admin-company-calendar', 'admin-item-master', 'admin-master-entry', 'admin-place', 'warehouse'];
const CRM_PATHS = ['crm-add-indent', 'crm-customer', 'crm-enquiry', 'crm-enquiry-details', 'crm-purchase', 'crm-task', 'crm-task-details', 'crm-update-indent', 'crm-view-indent', 'crm-visitors'];
const PROJECT_PATHS = ['project-add', 'project-edit', 'project-godown', 'project-mapping', 'project-material', 'project-mgmt', 'project-vendor', 'project-view', 'project-work-contract'];
const HR_PATHS = ['employee-salary', 'hr-attendance', 'hr-company', 'hr-contractors', 'hr-employee', 'hr-employee-add', 'hr-employee-attendance', 'hr-employee-details', 'hr-employee-salary-create', 'hr-labour-report', 'hr-machine-attendance', 'hr-machine-reading', 'hr-machine-report', 'hr-report', 'hr-task', 'hr-task-details', 'hr-vehicle', 'hr-vendor', 'hr-vendor-attendance', 'hr-working-daily-diary', 'salary-process', 'vendor-salary', 'vendor-salary-process'];
const STOCK_MANAGEMENT_PATHS = ['stock-add-gate-pass', 'stock-add-grn', 'stock-add-rent-item-gate-pass', 'stock-gate-entry-number', 'stock-gate-pass', 'stock-goods-received-notes', 'stock-inventory', 'stock-po-pr'];
const BOOKING_REGISTRY_PATHS = ['add-landlord', 'reg-booking-task', 'reg-cheque-list', 'reg-document-followup', 'reg-landlord', 'reg-payment-followup', 'reg-record', 'reg-trans-list'];

const routes: Routes = [
  {path : '', component: LoginComponent},
  {path : 'reset-password', component:ResetPasswordComponent},
  {path : 'dashboard', component: DashboardComponent},
  {path : 'forgot-password', component: ForgotPasswordComponent},
  {path : 'error', component: ErrorPageComponent},
  {path : 'edit-booking/:id/:prsn_id/:type',component: AddBookingRegistryComponent},
  {path : 'pdf-regbooking',component: RegistrybookingPdfComponent},
  { matcher: pathMatcher(REPORT_PATHS), loadChildren: () => import('./report/report.module').then(m => m.ReportModule) },
  { matcher: pathMatcher(FILE_MGMT_PATHS), loadChildren: () => import('./file-mgmt/file-mgmt.module').then(m => m.FileMgmtModule) },
  { matcher: pathMatcher(SALE_PATHS), loadChildren: () => import('./sale/sale.module').then(m => m.SaleModule) },
  { matcher: pathMatcher(ADMINISTRATION_PATHS), loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule) },
  { matcher: pathMatcher(PURCHASE_PATHS), loadChildren: () => import('./purchase/purchase.module').then(m => m.PurchaseModule) },
  { matcher: pathMatcher(PRODUCT_PATHS), loadChildren: () => import('./product/product.module').then(m => m.ProductModule) },
  { matcher: pathMatcher(ACCOUNT_PATHS), loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { matcher: pathMatcher(ADMIN_PATHS), loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { matcher: pathMatcher(CRM_PATHS), loadChildren: () => import('./crm/crm.module').then(m => m.CrmModule) },
  { matcher: pathMatcher(PROJECT_PATHS), loadChildren: () => import('./project/project.module').then(m => m.ProjectModule) },
  { matcher: pathMatcher(HR_PATHS), loadChildren: () => import('./hr/hr.module').then(m => m.HrModule) },
  { matcher: pathMatcher(STOCK_MANAGEMENT_PATHS), loadChildren: () => import('./stock-management/stock-management.module').then(m => m.StockManagementModule) },
  { matcher: pathMatcher(BOOKING_REGISTRY_PATHS), loadChildren: () => import('./booking-registry/booking-registry.module').then(m => m.BookingRegistryModule) }
  // {path : '', component: ModalsComponent},
  //{path: '**', redirectTo: '/error'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy'}),CommonModule,NgSelectModule,ReactiveFormsModule,FormsModule],  
  exports: [RouterModule],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppRoutingModule { }
export class AppModule { }
export const routings= [LoginComponent,DashboardComponent]

