import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CalendarItemDto } from './dto/calendar-item.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: CalendarQueryDto): Promise<CalendarItemDto[]> {
    const start = new Date(query.start);
    const end = new Date(query.end);

    const [masses, events] = await Promise.all([
      this.prismaService.mass.findMany({
        where: { dateTime: { gte: start, lte: end } },
        select: { id: true, title: true, dateTime: true },
      }),
      // Mesma regra já usada em EventsService.findAll (público): só ACTIVE.
      // Se quiser que o admin veja também CANCELLED no calendário, é um
      // ajuste a confirmar separadamente, não assumido aqui.
      this.prismaService.event.findMany({
        where: { startDate: { gte: start, lte: end }, status: 'ACTIVE' },
        select: { id: true, name: true, startDate: true },
      }),
    ]);

    const massItems: CalendarItemDto[] = masses.map((mass) => ({
      id: mass.id,
      title: mass.title,
      date: mass.dateTime.toISOString(),
      type: 'mass',
    }));

    const eventItems: CalendarItemDto[] = events.map((event) => ({
      id: event.id,
      title: event.name,
      date: event.startDate.toISOString(),
      type: 'event',
    }));

    return [...massItems, ...eventItems].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }
}
