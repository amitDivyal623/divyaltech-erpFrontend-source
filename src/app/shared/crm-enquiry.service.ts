import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CrmEnquiryService {
  private enquiryForm: FormGroup;

  setForm(form: FormGroup): void {
    this.enquiryForm = form;
  }

  getForm(): FormGroup {
    return this.enquiryForm;
  }
}
