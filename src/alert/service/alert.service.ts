import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IAlert } from "../interface/Interface-alert";
import { AlertType } from "../types/alert.type";






@Injectable({ providedIn: 'root' })

export class AlertService{
private  alertSubject=new BehaviorSubject<IAlert | null>(null);

alert$=this.alertSubject.asObservable()

showAlert(type:AlertType,message:string){
    this.alertSubject.next({type,message})
}


clearAlert(){
    this.alertSubject.next(null)
}
}