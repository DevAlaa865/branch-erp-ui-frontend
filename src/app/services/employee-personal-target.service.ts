import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import {
  EmployeePersonalTargetDto,
  EmployeePersonalTargetCreateDto
} from '../shared/models/employee-target.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeePersonalTargetService {

  private baseUrl = `${API_BASE_URL}/EmployeePersonalTarget`;

  constructor(private http: HttpClient) {}

  // 🔹 Get all personal targets for a shift header
  getByShiftHeader(shiftHeaderId: number): Observable<EmployeePersonalTargetDto[]> {
    return this.http.get<EmployeePersonalTargetDto[]>(`${this.baseUrl}/by-shift/${shiftHeaderId}`);
  }

  // 🔹 Create
  create(model: EmployeePersonalTargetCreateDto): Observable<EmployeePersonalTargetDto> {
    return this.http.post<EmployeePersonalTargetDto>(`${this.baseUrl}`, model);
  }

  // 🔹 Update
  update(id: number, model: EmployeePersonalTargetCreateDto): Observable<EmployeePersonalTargetDto> {
    return this.http.put<EmployeePersonalTargetDto>(`${this.baseUrl}/${id}`, model);
  }

  // 🔹 Delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
