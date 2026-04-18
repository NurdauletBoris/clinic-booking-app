import { Routes } from '@angular/router';
import { DoctorSearchComponent } from './components/doctor-search/doctor-search';
import { AppointmentBookingComponent } from './components/appointment-booking/appointment-booking';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '',         component: HomeComponent,  },
  { path: 'search',   component: DoctorSearchComponent,},
  { path: 'book/:id', component: AppointmentBookingComponent, },
  { path: '**',       redirectTo: '' }
];