import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export const calendarProviders = [
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory,
  }).providers || [],
];
