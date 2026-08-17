import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ProjectService } from '../../services/project.service';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-project-mapping',
  templateUrl: './project-mapping.component.html',
  styleUrls: ['./project-mapping.component.css'],
  providers: [NgbInputDatepickerConfig]
})
export class ProjectMappingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  model: NgbDateStruct;
  model_add: NgbDateStruct;
  model_view: NgbDateStruct;
  model_edit: NgbDateStruct;
  constructor(config: NgbInputDatepickerConfig, calendar: NgbCalendar,private projectservice:ProjectService) {
    
    config.minDate = {year: 1900, month: 1, day: 1};
    config.maxDate = {year: 2099, month: 12, day: 31};

    
    config.outsideDays = 'hidden';

    config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) >= 6;

  
    config.autoClose = 'outside';

   
    config.placement = ['bottom-left', 'bottom-right'];
  }

  ngOnInit(): void {
  }
  addProjectMapping = new FormGroup({
    project_id: new FormControl('',Validators.required),
		build_material_id: new FormControl('',Validators.required),
		quantity_need: new FormControl('',Validators.required),
		extra_quantity_added: new FormControl('',Validators.required)
  });
  saveProjectMapping() {

		//this.submitted = false;
    
		if(this.addProjectMapping.valid){
			//this.submitted = false;
      
			//const form = document.querySelector('form');
      let ProjectMappingData = new FormData();
      //let ProjectMappingData = new FormData(document.getElementById('form'));
			ProjectMappingData.append('project_id',this.addProjectMapping.get('project_id').value);
			ProjectMappingData.append('build_material_id',this.addProjectMapping.get('build_material_id').value);
      ProjectMappingData.append('quantity_need', this.addProjectMapping.get('quantity_need').value);
      ProjectMappingData.append('extra_quantity_added',this.addProjectMapping.get('extra_quantity_added').value);
      this.projectservice.addProjectMapping(ProjectMappingData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
       
				if(Response.CODE == 200) {
				Swal.fire({
					icon:'success',
					title:'Success!',
					text:Response.MESSAGE,
					showConfirmButton:false,
					timer:2000
				});
				this.addProjectMapping.reset();
				//this.closeModal();
				//this.rerender();
				}else{
					Swal.fire({
						icon:'error',
						title:'Error!',
						text:'Task Creation Failed',
						showConfirmButton:false,
						timer:3000
					});
				}
			});
		}else{
			//this.submitted = true;
			Swal.fire('Alert','Fill all required fields first','info');
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

}
