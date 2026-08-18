
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BOOTSTRAP_LISTENER, NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder} from '@angular/forms';
import { AppRoutingModule, routings} from './app-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';
import { AppComponent,  } from './app.component';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DatePipe } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HashLocationStrategy, LocationStrategy  } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InterceptorService } from './services/interceptor.service';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { RegistrybookingPdfComponent } from './registrybooking-pdf/registrybooking-pdf.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';






// import { AddRegistryComponent } from './booking-registry/add-registry/add-registry.component';
// import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    routings,
    ErrorPageComponent,
    ResetPasswordComponent,
    RegistrybookingPdfComponent,
    ForgotPasswordComponent,

   
    // AddRegistryComponent
    // ModalComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    HttpClientModule,
    SharedModule,
    InputsModule,
    DataTablesModule,
    DateInputsModule,
    NgxSpinnerModule,
    NoopAnimationsModule,

  ],
  exports : [],
  providers: [
    {provide : LocationStrategy , useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS,useClass: InterceptorService, multi: true },
    DatePipe
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ],
  bootstrap: [AppComponent],
})
export class AppModule { }
