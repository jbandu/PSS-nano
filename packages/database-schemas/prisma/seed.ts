import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // 1. ORGANIZATIONS
  // ============================================================================
  console.log('Creating organizations...');

  const skylineAir = await prisma.organization.upsert({
    where: { code: 'SKY' },
    update: {},
    create: {
      code: 'SKY',
      name: 'Skyline Airways',
      legalName: 'Skyline Airways International Ltd.',
      country: 'US',
      headquarters: 'New York, NY',
      contactEmail: 'ops@skylineairways.com',
      contactPhone: '+1-800-SKY-LINE',
      website: 'https://skylineairways.com',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
        defaultCheckInHours: 24,
      },
      features: {
        ancillaryServices: true,
        loyaltyProgram: true,
        mobileCheckIn: true,
      },
    },
  });

  const pacificWings = await prisma.organization.upsert({
    where: { code: 'PAC' },
    update: {},
    create: {
      code: 'PAC',
      name: 'Pacific Wings',
      legalName: 'Pacific Wings Airlines Inc.',
      country: 'US',
      headquarters: 'Los Angeles, CA',
      contactEmail: 'info@pacificwings.com',
      contactPhone: '+1-800-PAC-WING',
      website: 'https://pacificwings.com',
      settings: {
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        language: 'en',
      },
    },
  });

  console.log(`✓ Created ${skylineAir.name} and ${pacificWings.name}\n`);

  // ============================================================================
  // 2. USERS
  // ============================================================================
  console.log('Creating users...');

  const adminPassword = await hash('Admin123!', 10);
  const agentPassword = await hash('Agent123!', 10);
  const customerPassword = await hash('Customer123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skylineairways.com' },
    update: {},
    create: {
      organizationId: skylineAir.id,
      email: 'admin@skylineairways.com',
      password: adminPassword,
      firstName: 'Alice',
      lastName: 'Administrator',
      role: 'ADMIN',
      gender: 'FEMALE',
      phoneNumber: '+1-555-0101',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@skylineairways.com' },
    update: {},
    create: {
      organizationId: skylineAir.id,
      email: 'agent@skylineairways.com',
      password: agentPassword,
      firstName: 'Bob',
      lastName: 'Agent',
      role: 'AGENT',
      gender: 'MALE',
      phoneNumber: '+1-555-0102',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      organizationId: skylineAir.id,
      email: 'john.doe@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      role: 'CUSTOMER',
      gender: 'MALE',
      dateOfBirth: new Date('1985-06-15'),
      phoneNumber: '+1-555-0201',
      emailVerified: true,
      status: 'ACTIVE',
      preferences: {
        language: 'en',
        currency: 'USD',
        notifications: {
          email: true,
          sms: false,
        },
      },
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      organizationId: skylineAir.id,
      email: 'jane.smith@example.com',
      password: customerPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CUSTOMER',
      gender: 'FEMALE',
      dateOfBirth: new Date('1990-03-22'),
      phoneNumber: '+1-555-0202',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  console.log(`✓ Created ${admin.email}, ${agent.email}, and 2 customers\n`);

  // ============================================================================
  // 3. ROLES & PERMISSIONS
  // ============================================================================
  console.log('Creating roles and permissions...');

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Administrator' },
    update: {},
    create: {
      name: 'Super Administrator',
      description: 'Full system access',
      permissions: ['*'],
      isSystem: true,
    },
  });

  const bookingAgentRole = await prisma.role.upsert({
    where: { name: 'Booking Agent' },
    update: {},
    create: {
      name: 'Booking Agent',
      description: 'Can create and manage bookings',
      permissions: [
        'bookings:create',
        'bookings:read',
        'bookings:update',
        'passengers:create',
        'passengers:read',
        'passengers:update',
        'flights:read',
        'seats:read',
        'seats:assign',
      ],
      isSystem: true,
    },
  });

  console.log('✓ Created roles\n');

  // ============================================================================
  // 4. AIRPORTS
  // ============================================================================
  console.log('Creating airports...');

  const airports = [
    {
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'US',
      timezone: 'America/New_York',
      latitude: 40.6413,
      longitude: -73.7781,
    },
    {
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'US',
      timezone: 'America/Los_Angeles',
      latitude: 33.9416,
      longitude: -118.4085,
    },
    {
      code: 'ORD',
      name: "Chicago O'Hare International Airport",
      city: 'Chicago',
      country: 'US',
      timezone: 'America/Chicago',
      latitude: 41.9742,
      longitude: -87.9073,
    },
    {
      code: 'MIA',
      name: 'Miami International Airport',
      city: 'Miami',
      country: 'US',
      timezone: 'America/New_York',
      latitude: 25.7959,
      longitude: -80.2870,
    },
    {
      code: 'SFO',
      name: 'San Francisco International Airport',
      city: 'San Francisco',
      country: 'US',
      timezone: 'America/Los_Angeles',
      latitude: 37.6213,
      longitude: -122.3790,
    },
  ];

  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { code: airport.code },
      update: {},
      create: airport,
    });
  }

  console.log(`✓ Created ${airports.length} airports\n`);

  // ============================================================================
  // 5. AIRCRAFT
  // ============================================================================
  console.log('Creating aircraft...');

  const aircraft1 = await prisma.aircraft.create({
    data: {
      registration: 'N123SK',
      type: 'B737',
      manufacturer: 'Boeing',
      model: '737-800',
      totalSeats: 180,
      configuration: {
        cabins: [
          { class: 'BUSINESS', rows: 4, seatsPerRow: 4, totalSeats: 16 },
          { class: 'ECONOMY', rows: 28, seatsPerRow: 6, totalSeats: 164 },
        ],
      },
    },
  });

  const aircraft2 = await prisma.aircraft.create({
    data: {
      registration: 'N456SK',
      type: 'A320',
      manufacturer: 'Airbus',
      model: 'A320-200',
      totalSeats: 150,
      configuration: {
        cabins: [
          { class: 'BUSINESS', rows: 3, seatsPerRow: 4, totalSeats: 12 },
          { class: 'ECONOMY', rows: 23, seatsPerRow: 6, totalSeats: 138 },
        ],
      },
    },
  });

  console.log(`✓ Created aircraft ${aircraft1.registration} and ${aircraft2.registration}\n`);

  // ============================================================================
  // 6. FLIGHTS
  // ============================================================================
  console.log('Creating flights...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const arrivalTime = new Date(tomorrow);
  arrivalTime.setHours(15, 30, 0, 0);

  const jfkAirport = await prisma.airport.findUnique({ where: { code: 'JFK' } });
  const laxAirport = await prisma.airport.findUnique({ where: { code: 'LAX' } });
  const sfoAirport = await prisma.airport.findUnique({ where: { code: 'SFO' } });

  const flight1 = await prisma.flight.create({
    data: {
      organizationId: skylineAir.id,
      flightNumber: 'SKY101',
      operatingCarrier: 'SKY',
      aircraftId: aircraft1.id,
      aircraftType: 'B737-800',
      departureAirportId: jfkAirport!.id,
      arrivalAirportId: laxAirport!.id,
      scheduledDeparture: tomorrow,
      scheduledArrival: arrivalTime,
      status: 'SCHEDULED',
      totalSeats: 180,
      availableSeats: 180,
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      effectiveFrom: new Date(),
      effectiveTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      departureTerminal: '4',
      departureGate: 'B23',
    },
  });

  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const flight2 = await prisma.flight.create({
    data: {
      organizationId: skylineAir.id,
      flightNumber: 'SKY202',
      operatingCarrier: 'SKY',
      aircraftId: aircraft2.id,
      aircraftType: 'A320-200',
      departureAirportId: laxAirport!.id,
      arrivalAirportId: sfoAirport!.id,
      scheduledDeparture: nextWeek,
      scheduledArrival: new Date(nextWeek.getTime() + 90 * 60 * 1000),
      status: 'SCHEDULED',
      totalSeats: 150,
      availableSeats: 150,
      daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
      effectiveFrom: new Date(),
      effectiveTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✓ Created flights ${flight1.flightNumber} and ${flight2.flightNumber}\n`);

  // ============================================================================
  // 7. INVENTORY
  // ============================================================================
  console.log('Creating flight inventory...');

  await prisma.inventory.createMany({
    data: [
      {
        flightId: flight1.id,
        cabinClass: 'BUSINESS',
        bookingClass: 'J',
        totalSeats: 16,
        availableSeats: 16,
        authorizedSeats: 18, // Overbooking
      },
      {
        flightId: flight1.id,
        cabinClass: 'ECONOMY',
        bookingClass: 'Y',
        totalSeats: 100,
        availableSeats: 100,
        authorizedSeats: 110,
      },
      {
        flightId: flight1.id,
        cabinClass: 'ECONOMY',
        bookingClass: 'M',
        totalSeats: 64,
        availableSeats: 64,
        authorizedSeats: 70,
      },
      {
        flightId: flight2.id,
        cabinClass: 'BUSINESS',
        bookingClass: 'J',
        totalSeats: 12,
        availableSeats: 12,
        authorizedSeats: 14,
      },
      {
        flightId: flight2.id,
        cabinClass: 'ECONOMY',
        bookingClass: 'Y',
        totalSeats: 138,
        availableSeats: 138,
        authorizedSeats: 150,
      },
    ],
  });

  console.log('✓ Created inventory for flights\n');

  // ============================================================================
  // 8. SEATS
  // ============================================================================
  console.log('Creating seats...');

  const seats: any[] = [];
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Business class seats (rows 1-4)
  for (let row = 1; row <= 4; row++) {
    for (let i = 0; i < 4; i++) {
      seats.push({
        flightId: flight1.id,
        seatNumber: `${row}${columns[i]}`,
        row,
        column: columns[i],
        cabinClass: 'BUSINESS',
        isWindow: i === 0 || i === 3,
        isAisle: i === 1 || i === 2,
        hasExtraLegroom: row === 1,
        basePrice: 500,
        currentPrice: 500,
      });
    }
  }

  // Economy seats (rows 10-37)
  for (let row = 10; row <= 37; row++) {
    for (let i = 0; i < 6; i++) {
      seats.push({
        flightId: flight1.id,
        seatNumber: `${row}${columns[i]}`,
        row,
        column: columns[i],
        cabinClass: 'ECONOMY',
        isWindow: i === 0 || i === 5,
        isAisle: i === 2 || i === 3,
        isEmergencyExit: row === 12 || row === 24,
        hasExtraLegroom: row === 12 || row === 24,
        basePrice: row === 12 || row === 24 ? 50 : 25,
        currentPrice: row === 12 || row === 24 ? 50 : 25,
      });
    }
  }

  await prisma.seat.createMany({ data: seats });
  console.log(`✓ Created ${seats.length} seats\n`);

  // ============================================================================
  // 9. FARES
  // ============================================================================
  console.log('Creating fares...');

  const validFrom = new Date();
  const validTo = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  const fare1 = await prisma.fare.create({
    data: {
      organizationId: skylineAir.id,
      flightId: flight1.id,
      fareClass: 'BUSINESS',
      fareType: 'PUBLISHED',
      cabinClass: 'BUSINESS',
      bookingClass: 'J',
      baseAmount: 899.00,
      currency: 'USD',
      taxes: {
        items: [
          { code: 'US', amount: 45.00, description: 'US Transportation Tax' },
          { code: 'XF', amount: 12.50, description: 'Passenger Facility Charge' },
          { code: 'AY', amount: 5.60, description: 'September 11 Security Fee' },
        ],
      },
      validFrom,
      validTo,
      isRefundable: true,
      isChangeable: true,
      changeFee: 0,
      baggageAllowance: {
        carryOn: { pieces: 2, weight: 18 },
        checked: { pieces: 2, weight: 70 },
      },
      rules: {
        minStay: 0,
        maxStay: 365,
        advancePurchase: 0,
      },
    },
  });

  const fare2 = await prisma.fare.create({
    data: {
      organizationId: skylineAir.id,
      flightId: flight1.id,
      fareClass: 'ECONOMY_FLEX',
      fareType: 'PUBLISHED',
      cabinClass: 'ECONOMY',
      bookingClass: 'Y',
      baseAmount: 349.00,
      currency: 'USD',
      taxes: {
        items: [
          { code: 'US', amount: 27.00, description: 'US Transportation Tax' },
          { code: 'XF', amount: 12.50, description: 'Passenger Facility Charge' },
          { code: 'AY', amount: 5.60, description: 'September 11 Security Fee' },
        ],
      },
      validFrom,
      validTo,
      isRefundable: false,
      isChangeable: true,
      changeFee: 75.00,
      baggageAllowance: {
        carryOn: { pieces: 1, weight: 10 },
        checked: { pieces: 1, weight: 23 },
      },
    },
  });

  const fare3 = await prisma.fare.create({
    data: {
      organizationId: skylineAir.id,
      flightId: flight1.id,
      fareClass: 'ECONOMY_BASIC',
      fareType: 'PROMOTIONAL',
      cabinClass: 'ECONOMY',
      bookingClass: 'M',
      baseAmount: 199.00,
      currency: 'USD',
      taxes: {
        items: [
          { code: 'US', amount: 15.00, description: 'US Transportation Tax' },
          { code: 'XF', amount: 12.50, description: 'Passenger Facility Charge' },
          { code: 'AY', amount: 5.60, description: 'September 11 Security Fee' },
        ],
      },
      validFrom,
      validTo,
      advancePurchase: 14,
      isRefundable: false,
      isChangeable: false,
      baggageAllowance: {
        carryOn: { pieces: 1, weight: 10 },
        checked: { pieces: 0, weight: 0 },
      },
    },
  });

  console.log('✓ Created 3 fare classes\n');

  // ============================================================================
  // 10. ANCILLARY PRODUCTS
  // ============================================================================
  console.log('Creating ancillary products...');

  const ancillaries = [
    {
      organizationId: skylineAir.id,
      code: 'BAG_CHECKED_1',
      name: 'First Checked Bag',
      description: 'Up to 23kg (50lbs)',
      type: 'BAGGAGE',
      basePrice: 35.00,
      currency: 'USD',
      cabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
      fareBases: ['M', 'Y', 'J'],
      maxQuantity: 3,
    },
    {
      organizationId: skylineAir.id,
      code: 'BAG_CHECKED_2',
      name: 'Second Checked Bag',
      description: 'Up to 23kg (50lbs)',
      type: 'BAGGAGE',
      basePrice: 45.00,
      currency: 'USD',
      cabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
      fareBases: ['M', 'Y', 'J'],
      maxQuantity: 3,
    },
    {
      organizationId: skylineAir.id,
      code: 'SEAT_EXTRA_LEGROOM',
      name: 'Extra Legroom Seat',
      description: 'Priority seating with extra legroom',
      type: 'EXTRA_LEGROOM',
      basePrice: 50.00,
      currency: 'USD',
      cabinClasses: ['ECONOMY'],
      fareBases: ['M', 'Y'],
      maxQuantity: 1,
    },
    {
      organizationId: skylineAir.id,
      code: 'PRIORITY_BOARDING',
      name: 'Priority Boarding',
      description: 'Board early in Zone 1',
      type: 'PRIORITY_BOARDING',
      basePrice: 15.00,
      currency: 'USD',
      cabinClasses: ['ECONOMY'],
      fareBases: ['M', 'Y'],
      maxQuantity: 1,
    },
    {
      organizationId: skylineAir.id,
      code: 'WIFI_FULL',
      name: 'Full Flight WiFi',
      description: 'Unlimited WiFi access',
      type: 'WIFI',
      basePrice: 19.99,
      currency: 'USD',
      cabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
      fareBases: ['M', 'Y', 'J'],
      maxQuantity: 1,
    },
    {
      organizationId: skylineAir.id,
      code: 'MEAL_PREMIUM',
      name: 'Premium Meal Selection',
      description: 'Chef-inspired meal with beverage',
      type: 'MEAL',
      basePrice: 25.00,
      currency: 'USD',
      cabinClasses: ['ECONOMY'],
      fareBases: ['M', 'Y'],
      maxQuantity: 1,
    },
  ];

  for (const ancillary of ancillaries) {
    await prisma.ancillaryProduct.create({ data: ancillary as any });
  }

  console.log(`✓ Created ${ancillaries.length} ancillary products\n`);

  // ============================================================================
  // 11. SAMPLE BOOKING (PNR)
  // ============================================================================
  console.log('Creating sample booking...');

  const pnr1 = await prisma.pNR.create({
    data: {
      organizationId: skylineAir.id,
      userId: customer1.id,
      pnr: 'ABC123',
      status: 'CONFIRMED',
      contactEmail: customer1.email,
      contactPhone: customer1.phoneNumber!,
      contactName: `${customer1.firstName} ${customer1.lastName}`,
      bookingChannel: 'WEB',
      totalAmount: 394.10,
      baseAmount: 349.00,
      taxAmount: 45.10,
      currency: 'USD',
      paymentStatus: 'COMPLETED',
      paidAmount: 394.10,
      expiryDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      segments: {
        create: [
          {
            flightId: flight1.id,
            fareId: fare2.id,
            segmentNumber: 1,
            flightNumber: flight1.flightNumber,
            departureAirport: 'JFK',
            arrivalAirport: 'LAX',
            departureDate: flight1.scheduledDeparture,
            arrivalDate: flight1.scheduledArrival,
            cabinClass: 'ECONOMY',
            bookingClass: 'Y',
            fareBasis: 'YOWUS',
            baseAmount: 349.00,
            taxAmount: 45.10,
            totalAmount: 394.10,
            currency: 'USD',
          },
        ],
      },
      passengers: {
        create: [
          {
            type: 'ADULT',
            title: 'Mr',
            firstName: customer1.firstName,
            lastName: customer1.lastName,
            gender: 'MALE',
            dateOfBirth: customer1.dateOfBirth!,
            email: customer1.email,
            phoneNumber: customer1.phoneNumber,
            documentType: 'PASSPORT',
            documentNumber: 'US1234567',
            documentIssueCountry: 'US',
            documentExpiry: new Date('2030-12-31'),
            nationality: 'US',
            seatAssignment: '15A',
          },
        ],
      },
    },
  });

  console.log(`✓ Created booking ${pnr1.pnr}\n`);

  // ============================================================================
  // 12. PAYMENT
  // ============================================================================
  console.log('Creating payment record...');

  const payment1 = await prisma.payment.create({
    data: {
      pnrId: pnr1.id,
      userId: customer1.id,
      amount: 394.10,
      currency: 'USD',
      method: 'CREDIT_CARD',
      gateway: 'STRIPE',
      transactionId: `txn_${Date.now()}`,
      gatewayTransactionId: 'ch_stripe123456',
      authorizationCode: 'AUTH123',
      cardLast4: '4242',
      cardBrand: 'Visa',
      status: 'COMPLETED',
      authorizedAt: new Date(),
      capturedAt: new Date(),
      gatewayResponse: {
        id: 'ch_stripe123456',
        status: 'succeeded',
        amount: 39410,
      },
      ipAddress: '192.168.1.100',
    },
  });

  console.log(`✓ Created payment for ${payment1.amount} ${payment1.currency}\n`);

  // ============================================================================
  // 13. CUSTOMER SEGMENTS
  // ============================================================================
  console.log('Creating customer segments...');

  await prisma.customerSegment.create({
    data: {
      userId: customer1.id,
      segmentName: 'FREQUENT_FLYER',
      segmentType: 'BEHAVIORAL',
      attributes: {
        totalFlights: 15,
        averageSpend: 450.00,
        preferredRoutes: ['JFK-LAX', 'LAX-SFO'],
      },
      lifetimeValue: 6750.00,
      churnRisk: 0.15,
      engagementScore: 0.85,
    },
  });

  console.log('✓ Created customer segment\n');

  // ============================================================================
  // 14. CAMPAIGN
  // ============================================================================
  console.log('Creating marketing campaign...');

  const campaign = await prisma.campaign.create({
    data: {
      organizationId: skylineAir.id,
      name: 'Summer Sale 2024',
      description: '25% off select routes',
      type: 'PROMOTIONAL',
      discountType: 'PERCENTAGE',
      discountValue: 25,
      targetSegments: ['ALL'],
      targetRoutes: ['JFK-LAX', 'LAX-SFO'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budget: 100000,
      spent: 15000,
      impressions: 50000,
      clicks: 2500,
      conversions: 125,
      revenue: 43750,
    },
  });

  console.log(`✓ Created campaign "${campaign.name}"\n`);

  // ============================================================================
  // 15. API KEY
  // ============================================================================
  console.log('Creating API key...');

  await prisma.apiKey.create({
    data: {
      organizationId: skylineAir.id,
      userId: admin.id,
      name: 'Production API Key',
      key: 'sk_live_' + Math.random().toString(36).substring(2, 15),
      secret: Math.random().toString(36).substring(2, 30),
      scopes: [
        'flights:read',
        'bookings:create',
        'bookings:read',
        'payments:create',
      ],
      rateLimit: 1000,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✓ Created API key\n');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Database seeding completed successfully!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📊 Summary:');
  console.log('  • 2 Organizations (Airlines)');
  console.log('  • 4 Users (1 Admin, 1 Agent, 2 Customers)');
  console.log('  • 2 Roles with permissions');
  console.log('  • 5 Airports');
  console.log('  • 2 Aircraft');
  console.log('  • 2 Flights with inventory');
  console.log(`  • ${seats.length} Seats`);
  console.log('  • 3 Fare classes');
  console.log(`  • ${ancillaries.length} Ancillary products`);
  console.log('  • 1 Sample booking (PNR)');
  console.log('  • 1 Payment record');
  console.log('  • 1 Customer segment');
  console.log('  • 1 Marketing campaign');
  console.log('  • 1 API key\n');

  console.log('🔑 Test Credentials:');
  console.log('  Admin:    admin@skylineairways.com / Admin123!');
  console.log('  Agent:    agent@skylineairways.com / Agent123!');
  console.log('  Customer: john.doe@example.com / Customer123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
