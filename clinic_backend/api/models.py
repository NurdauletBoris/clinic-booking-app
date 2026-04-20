from django.db import models
from django.contrib.auth.models import User

class ActiveDoctorManager(models.Manager):

    def active(self):
        return self.get_queryset().filter(is_active=True)

    def by_specialty(self, specialty: str):
        return self.active().filter(specialty__iexact=specialty)


class Doctor(models.Model):

    name       = models.CharField(max_length=200)
    specialty  = models.CharField(max_length=100)
    experience = models.PositiveIntegerField(help_text='Years of experience')
    rating     = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    price      = models.PositiveIntegerField(help_text='Price in KZT tenge')
    clinic     = models.CharField(max_length=200)
    address    = models.CharField(max_length=300)
    photo_url  = models.URLField(max_length=500, blank=True)
    slots      = models.TextField(blank=True, help_text='Comma-separated time slots')
    is_active  = models.BooleanField(default=True)
    objects     = ActiveDoctorManager()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} — {self.specialty}'

    def get_slots_list(self):
        """Return slots as a Python list."""
        if not self.slots:
            return []
        return [s.strip() for s in self.slots.split(',') if s.strip()]


class Appointment(models.Model):

    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments',
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
    )

    patient_name = models.CharField(max_length=200)
    date         = models.CharField(max_length=20)   
    time         = models.CharField(max_length=10)   
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient_name} → {self.doctor.name} on {self.date} at {self.time}'


class Review(models.Model):

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='reviews',
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews',
    )

    reviewer_name = models.CharField(max_length=200, blank=True, default='Аноним')
    comment       = models.TextField()
    rating        = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text='1–5 stars',
    )
    date          = models.CharField(max_length=50, blank=True) 
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Review by {self.reviewer_name} for {self.doctor.name}'


class UserProfile(models.Model):

    user  = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f'Profile({self.user.username})'
