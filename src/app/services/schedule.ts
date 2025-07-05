import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule, Person } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:7301/api/v1'; // Adjust if your backend runs on a different port or host

  constructor(private http: HttpClient) { }

  getSchedulesByMonth(year: number, month: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/schedules/${year}/${month}`);
  }

  getSchedulesByYear(year: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/schedules/${year}`);
  }

  getAllPeople(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/people`);
  }

  getPersonContent(personId: number, year: number, month?: number): Observable<any> {
    if (month) {
      return this.http.get<any>(`${this.apiUrl}/analysis/person/${personId}/${year}/${month}`);
    } else {
      return this.http.get<any>(`${this.apiUrl}/analysis/person/${personId}/${year}`);
    }
  }
}
