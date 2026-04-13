import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Doctor } from '../../models/doctor.model';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './doctor-search.html',
  styleUrls: ['./doctor-search.css']
})
export class DoctorSearchComponent implements OnInit {
  allDoctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specialties: string[] = [];
  clinics: string[] = [];
  
  searchText: string = '';
  selectedSpecialty: string = '';
  selectedClinic: string = '';

  constructor(
    private bookingService: BookingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.bookingService.getDoctors().subscribe(data => {
      this.allDoctors = data;
      this.extractFilters();
      
      this.route.queryParams.subscribe(params => {
        this.selectedSpecialty = params['specialty'] || '';
        this.searchText = params['q'] || '';
        this.applyFilters();
      });
    });
  }

  extractFilters() {
    this.specialties = [...new Set(this.allDoctors.map(d => d.specialty))].sort();
    this.clinics = [...new Set(this.allDoctors.map(d => d.clinic))].sort();
  }

  applyFilters() {
    this.filteredDoctors = this.allDoctors.filter(doctor => {
      const matchesName = doctor.name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesSpecialty = this.selectedSpecialty === '' || doctor.specialty === this.selectedSpecialty;
      const matchesClinic = this.selectedClinic === '' || doctor.clinic === this.selectedClinic;
      return matchesName && matchesSpecialty && matchesClinic;
    });
  }
}