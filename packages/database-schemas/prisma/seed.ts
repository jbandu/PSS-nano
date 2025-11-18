import { PrismaClient, UserRole, FlightStatus, CabinClass } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@airlineops.com' },
    update: {},
    create: {
      email: 'admin@airlineops.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create test customer
  const customerPassword = await hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      phoneNumber: '+1234567890',
      emailVerified: true,
    },
  });
  console.log('Created customer user:', customer.email);

  // Create sample flights
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const arrivalTime = new Date(tomorrow);
  arrivalTime.setHours(13, 30, 0, 0);

  const flight1 = await prisma.flight.create({
    data: {
      flightNumber: 'AA101',
      airlineCode: 'AA',
      departureAirport: 'JFK',
      arrivalAirport: 'LAX',
      scheduledDeparture: tomorrow,
      scheduledArrival: arrivalTime,
      status: FlightStatus.SCHEDULED,
      aircraftType: 'Boeing 737',
      capacity: 180,
      availableSeats: 180,
    },
  });
  console.log('Created flight:', flight1.flightNumber);

  // Create inventory for the flight
  await prisma.inventory.createMany({
    data: [
      {
        flightId: flight1.id,
        cabinClass: CabinClass.ECONOMY,
        totalSeats: 150,
        availableSeats: 150,
      },
      {
        flightId: flight1.id,
        cabinClass: CabinClass.BUSINESS,
        totalSeats: 30,
        availableSeats: 30,
      },
    ],
  });
  console.log('Created inventory for flight:', flight1.flightNumber);

  // Create sample seats
  const seats = [];
  for (let row = 1; row <= 30; row++) {
    for (const seat of ['A', 'B', 'C', 'D', 'E', 'F']) {
      seats.push({
        flightId: flight1.id,
        seatNumber: `${row}${seat}`,
        cabinClass: row <= 5 ? CabinClass.BUSINESS : CabinClass.ECONOMY,
        isAvailable: true,
        price: row <= 5 ? 500 : 200,
        isEmergencyExit: row === 12,
      });
    }
  }
  await prisma.seat.createMany({ data: seats });
  console.log('Created seats for flight:', flight1.flightNumber);

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
