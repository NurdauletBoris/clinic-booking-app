export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  price: number;
  clinic: string;
  address: string;
  photoUrl: string;
  slots: string[];
}

export interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  clinicName: string;
  patientName: string;
  date: string;
  time: string;
}

export interface Review {
  comment: string;
  doctorName: string;
  specialty: string;
  photo: string;
  rating?: number;
  date?: string;
  reviewerName?: string;
}