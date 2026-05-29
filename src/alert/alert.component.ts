import { Component,  OnInit } from '@angular/core';
import { AlertService } from './service/alert.service';
import { IAlert } from './interface/Interface-alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements  OnInit {
alert:IAlert|null= null


constructor(private alertService:AlertService){}

ngOnInit(){
 this.alertService.alert$.subscribe(alert=>{
  this.alert=alert
  if(alert){
    setTimeout(()=>this.close(),3000)
  }
 })
}


  close(event?: MouseEvent) {
    if(event) event.preventDefault();
    this.alertService.clearAlert();
  }

}
