import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { MassesModule } from './masses/masses.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AlbumsModule } from './albums/albums.module';
import { PhotosModule } from './photos/photos.module';
import { SacramentsModule } from './sacraments/sacraments.module';
import { PastoralGroupsModule } from './pastoral-groups/pastoral-groups.module';
import { AttendanceConfirmationsModule } from './attendance-confirmations/attendance-confirmations.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, RolesModule, VolunteersModule, MassesModule, EventsModule, CategoriesModule, SchedulesModule, AnnouncementsModule, AlbumsModule, PhotosModule, SacramentsModule, PastoralGroupsModule, AttendanceConfirmationsModule, AuditLogsModule],
})
export class AppModule {}
