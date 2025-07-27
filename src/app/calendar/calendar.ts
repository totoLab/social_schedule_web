import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarEvent, CalendarView } from 'angular-calendar';
import { ScheduleService } from '../services/schedule';
import { Schedule } from '../models';
import { addMonths, subMonths,  isSameDay, isSameMonth  } from 'date-fns';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.fetchSchedules();
  }

  fetchSchedules(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth() + 1; // Month is 0-indexed in Date, 1-indexed in API
    this.scheduleService.getSchedulesByMonth(year, month).subscribe({
      next: (data) => {
        this.calendarEvents = data.map(s => ({
          title: `${s.person.name} - ${s.contentType.name}`,
          start: new Date(s.scheduledDate),
          color: { primary: s.person.color, secondary: s.person.color },
          allDay: true
        }));
      },
      error: (err) => {
        console.error('Error fetching schedules', err);
      }
    });
  }

  incrementMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.fetchSchedules();
  }

  decrementMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
    this.fetchSchedules();
  }

  today(): void {
    this.viewDate = new Date();
    this.fetchSchedules();
  }

  // Optional: Add event handlers for calendar interactions
  handleEvent(action: string, event: CalendarEvent): void {
    console.log(`Event ${action}:`, event);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }
}
