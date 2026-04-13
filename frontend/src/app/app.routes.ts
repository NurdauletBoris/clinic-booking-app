import { Routes } from '@angular/router';
import { DoctorSearchComponent } from './components/doctor-search/doctor-search';
import { AppointmentBookingComponent } from './components/appointment-booking/appointment-booking';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: DoctorSearchComponent },
  { path: 'book/:id', component: AppointmentBookingComponent }
];