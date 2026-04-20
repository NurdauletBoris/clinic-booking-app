from django.urls import path
from . import views

urlpatterns = [
    path('auth/login',    views.login_view,            name='auth-login'),
    path('auth/logout',   views.logout_view,           name='auth-logout'),
    path('auth/register', views.RegisterView.as_view(), name='auth-register'),

    path('doctors', views.DoctorListView.as_view(), name='doctor-list'),

    path('appointments',                views.AppointmentView.as_view(),       name='appointment-list'),
    path('appointments/booked-slots',   views.booked_slots_view,               name='booked-slots'),
    path('appointments/<int:pk>/',      views.AppointmentDetailView.as_view(), name='appointment-detail'),

    path('reviews', views.ReviewView.as_view(), name='review-list'),
]