import { prisma } from '@airline-ops/database-schemas';
import { CreateReservationRequest, Reservation } from '@airline-ops/shared-types';
import { generatePNR, NotFoundError, ConflictError } from '@airline-ops/shared-utils';

export class ReservationService {
  async create(data: CreateReservationRequest): Promise<Reservation> {
    // Check flight availability
    const flight = await prisma.flight.findUnique({ where: { id: data.flightId } });
    if (!flight) throw new NotFoundError('Flight');
    if (flight.availableSeats < data.passengers.length) {
      throw new ConflictError('Not enough seats available');
    }

    // Create reservation with passengers
    const pnr = generatePNR();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const reservation = await prisma.reservation.create({
      data: {
        userId: data.userId,
        pnr,
        flightId: data.flightId,
        cabinClass: data.cabinClass,
        seatNumbers: data.seatNumbers || [],
        totalAmount: 0, // Calculate based on pricing
        expiryDate,
        passengers: {
          create: data.passengers,
        },
      },
      include: { passengers: true, flight: true },
    });

    // Update flight inventory
    await prisma.flight.update({
      where: { id: data.flightId },
      data: { availableSeats: { decrement: data.passengers.length } },
    });

    return reservation as any;
  }

  async getById(id: string): Promise<Reservation> {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { passengers: true, flight: true, user: true },
    });
    if (!reservation) throw new NotFoundError('Reservation');
    return reservation as any;
  }

  async getByPNR(pnr: string): Promise<Reservation> {
    const reservation = await prisma.reservation.findUnique({
      where: { pnr },
      include: { passengers: true, flight: true },
    });
    if (!reservation) throw new NotFoundError('Reservation');
    return reservation as any;
  }

  async listByUser(userId: string): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: { userId },
      include: { passengers: true, flight: true },
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  async update(id: string, data: any): Promise<Reservation> {
    const reservation = await prisma.reservation.update({
      where: { id },
      data,
      include: { passengers: true, flight: true },
    });
    return reservation as any;
  }

  async cancel(id: string): Promise<void> {
    const reservation = await this.getById(id);

    await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Restore flight inventory
    await prisma.flight.update({
      where: { id: reservation.flightId },
      data: { availableSeats: { increment: reservation.passengers.length } },
    });
  }
}
