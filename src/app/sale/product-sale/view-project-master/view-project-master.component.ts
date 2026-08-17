import { Component, OnInit,ViewChild,ElementRef, ChangeDetectorRef, Input  } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-view-project-master',
  templateUrl: './view-project-master.component.html',
  styleUrls: ['./view-project-master.component.css']
})
export class ViewProjectMasterComponent implements OnInit {
  [x: string]: any;
  
  constructor() { }
  @ViewChild('labelImport')labelImport: ElementRef;
  @ViewChild('fileInput') el: ElementRef;
  imageUrl: any = 'assets/img/upload.jpg';
  editFile: boolean = true;
  removeUpload: boolean = false;
  onFileChange(files: FileList) {
    this.labelImport.nativeElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    this.fileToUpload = files.item(0);
  }

  import(): void {
    console.log('import ' + this.fileToUpload.name);
  }
 

  uploadFile(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.editFile = false;
        this.removeUpload = true;
      }
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();        
    }
  }
  ngOnInit(): void {
  }

}
