import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';
  categories: string[] = [];

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.bookingService.getDoctors().subscribe(doctors => {
      this.categories = [...new Set(doctors.map(d => d.specialty))].sort();
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  filterByCategory(name: string) {
    this.router.navigate(['/search'], { queryParams: { specialty: name } });
  }

  handleIconError(event: any) {
    event.target.src = 'https://cdn-icons-png.flaticon.com/512/387/387561.png';
  }
}