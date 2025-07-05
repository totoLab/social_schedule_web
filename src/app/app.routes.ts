import { Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar';
import { PeopleComponent } from './people/people';

export const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: 'calendar', component: CalendarComponent },
  { path: 'people', component: PeopleComponent },
];
