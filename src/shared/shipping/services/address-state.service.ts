import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Address } from '../model/address.model';

@Injectable({ providedIn: 'root' })
export class AddressStateService {
  private addressSubject = new BehaviorSubject<Address | null>(null);
  address$ = this.addressSubject.asObservable();

  setAddress(address: Address | null) {
    this.addressSubject.next(address);
  }
}