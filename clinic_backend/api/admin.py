from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Doctor, Appointment, Review, UserProfile

class UserProfileInline(admin.StackedInline):
    model  = UserProfile
    can_delete = False
    verbose_name_plural = 'Профиль (телефон)'
    fields = ('phone',)


class UserAdmin(BaseUserAdmin):
    inlines            = (UserProfileInline,)
    list_display       = ('username', 'email', 'get_phone', 'is_staff', 'date_joined')
    list_display_links = ('username',)

    @admin.display(description='Телефон')
    def get_phone(self, obj):
        try:
            return obj.profile.phone or '—'
        except UserProfile.DoesNotExist:
            return '—'


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display   = ('name', 'specialty', 'clinic', 'price', 'rating', 'is_active')
    list_filter    = ('specialty', 'is_active')
    search_fields  = ('name', 'clinic', 'specialty')
    list_editable  = ('is_active',)

    def get_queryset(self, request):
        return Doctor._default_manager.all()


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display   = ('patient_name', 'doctor', 'date', 'time', 'status', 'user')
    list_filter    = ('status', 'date')
    search_fields  = ('patient_name', 'doctor__name')
    list_editable  = ('status',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display   = ('reviewer_name', 'doctor', 'rating', 'created_at')
    list_filter    = ('rating',)
    search_fields  = ('reviewer_name', 'doctor__name', 'comment')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display   = ('user', 'get_email', 'phone')
    search_fields  = ('user__username', 'user__email', 'phone')

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email