import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import {
  EmployeeShiftTargetHeaderDto,
  EmployeeShiftTargetHeaderCreateDto
} from '../shared/models/employee-target.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeShiftTargetHeaderService {

  private baseUrl = `${API_BASE_URL}/EmployeeShiftTargetHeader`;

  constructor(private http: HttpClient) {}

  // 🔹 Get by Id
  getById(id: number): Observable<EmployeeShiftTargetHeaderDto> {
    return this.http.get<EmployeeShiftTargetHeaderDto>(`${this.baseUrl}/${id}`);
  }

  // 🔹 Create
  create(model: EmployeeShiftTargetHeaderCreateDto): Observable<EmployeeShiftTargetHeaderDto> {
    return this.http.post<EmployeeShiftTargetHeaderDto>(`${this.baseUrl}`, model);
  }

  // 🔹 Delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
