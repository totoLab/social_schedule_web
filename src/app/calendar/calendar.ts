import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../services/schedule';
import { Schedule } from '../models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];
  schedules: Schedule[] = [];

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.generateCalendar();
    this.fetchSchedules();
  }

  generateCalendar(): void {
    this.daysInMonth = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.daysInMonth.push(new Date(year, month, i));
    }
  }

  fetchSchedules(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth() + 1; // Month is 0-indexed in Date, 1-indexed in API
    this.scheduleService.getSchedulesByMonth(year, month).subscribe({
      next: (data) => {
        this.schedules = data;
      },
      error: (err) => {
        console.error('Error fetching schedules', err);
      }
    });
  }

  getScheduleForDay(day: Date): Schedule | undefined {
    return this.schedules.find(s => new Date(s.scheduledDate).toDateString() === day.toDateString());
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
    this.fetchSchedules();
  }

  prevMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
    this.fetchSchedules();
  }
}
