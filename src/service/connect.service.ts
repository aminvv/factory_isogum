import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {


  constructor(private http:HttpClient) { }
  apiURL='http://localhost:3000'



  getProductBySubCategory(id:any){
    return this.http.get(this.apiURL+'/product/category/'+id)
  }
}
 