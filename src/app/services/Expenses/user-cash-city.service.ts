import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../../api.config';


@Injectable({
  providedIn: 'root'
})
export class UserCashCityService {

  private baseUrl = `${API_BASE_URL}/UserCashCity`;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any>(`${this.baseUrl}/users`);
  }

  getCities() {
    return this.http.get<any>(`${this.baseUrl}/cities`);
  }

  getUserCashCities(userId: string) {
    return this.http.get<any>(`${this.baseUrl}/get/${userId}`);
  }

  saveUserCashCities(body: any) {
    return this.http.post<any>(`${this.baseUrl}/save`, body);
  }
}
