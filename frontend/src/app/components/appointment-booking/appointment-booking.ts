import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Doctor, Appointment } from '../../models/doctor.model';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-booking.html',
  styleUrls: ['./appointment-booking.css']
})
export class AppointmentBookingComponent implements OnInit {
  doctor?: Doctor;
  selectedSlot: string = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctor = this.bookingService.getDoctorById(id);
  }

  goBack() {
    this.location.back();
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
  }

  confirmBooking() {
    if (this.doctor && this.selectedSlot) {
      const newAppt: Appointment = {
        id: Date.now(),
        doctorId: this.doctor.id,
        doctorName: this.doctor.name,
        clinicName: this.doctor.clinic, // Добавили передачу клиники
        patientName: 'Daniyar', // Твое имя
        date: '2026-04-20',
        time: this.selectedSlot
      };

      this.bookingService.bookAppointment(newAppt);
      alert(`Запись подтверждена в ${this.doctor.clinic}!`);
      this.router.navigate(['/search']);
    }
  }
}