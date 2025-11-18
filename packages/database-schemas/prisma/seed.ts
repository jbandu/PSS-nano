import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - be careful in production!)
  console.log('🧹 Cleaning existing data...');
  
  // ============================================================================
  // ORGANIZATIONS (Airlines)
  // ============================================================================
  
  console.log('✈️  Creating airlines...');
  
  const airline1 = await prisma.organization.upsert({
    where: { code: 'AA' },
    update: {},
    create: {
      code: 'AA',
      name: 'American Airlines',
      legalName: 'American Airlines, Inc.',
      iataCode: 'AA',
      icaoCode: 'AAL',
      country: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
      status: 'ACTIVE',
    },
  });

  const airline2 = await prisma.organization.upsert({
    where: { code: 'DL' },
    update: {},
    create: {
      code: 'DL',
      name: 'Delta Air Lines',
      legalName: 'Delta Air Lines, Inc.',
      iataCode: 'DL',
      icaoCode: 'DAL',
      country: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
      status: 'ACTIVE',
    },
  });

  const airline3 = await prisma.organization.upsert({
    where: { code: 'UA' },
    update: {},
    create: {
      code: 'UA',
      name: 'United Airlines',
      legalName: 'United Airlines, Inc.',
      iataCode: 'UA',
      icaoCode: 'UAL',
      country: 'US',
      currency: 'USD',
      timezone: 'America/Chicago',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created ${3} airlines`);

  // ============================================================================
  // ROLES & PERMISSIONS
  // ============================================================================
  
  console.log('🔐 Creating roles and permissions...');

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access',
      isSystem: true,
      level: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Organization administrator',
      isSystem: true,
      level: 'ADMIN',
      isActive: true,
    },
  });

  const agentRole = await prisma.role.upsert({
    where: { name: 'agent' },
    update: {},
    create: {
      name: 'agent',
      displayName: 'Check-in Agent',
      description: 'Airport check-in and boarding agent',
      isSystem: true,
      level: 'AGENT',
      isActive: true,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: {
      name: 'customer',
      displayName: 'Customer',
      description: 'Regular customer/passenger',
      isSystem: true,
      level: 'USER',
      isActive: true,
    },
  });

  // Create permissions
  const permissions = [
    { name: 'pnr:create', resource: 'pnr', action: 'CREATE', displayName: 'Create PNR' },
    { name: 'pnr:read', resource: 'pnr', action: 'READ', displayName: 'Read PNR' },
    { name: 'pnr:update', resource: 'pnr', action: 'UPDATE', displayName: 'Update PNR' },
    { name: 'pnr:delete', resource: 'pnr', action: 'DELETE', displayName: 'Delete PNR' },
    { name: 'flight:manage', resource: 'flight', action: 'MANAGE', displayName: 'Manage Flights' },
    { name: 'user:manage', resource: 'user', action: 'MANAGE', displayName: 'Manage Users' },
    { name: 'checkin:execute', resource: 'checkin', action: 'EXECUTE', displayName: 'Execute Check-in' },
    { name: 'boarding:execute', resource: 'boarding', action: 'EXECUTE', displayName: 'Execute Boarding' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log(`✅ Created ${4} roles and ${permissions.length} permissions`);

  // ============================================================================
  // USERS
  // ============================================================================
  
  console.log('👤 Creating users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@americanair.com' },
    update: {},
    create: {
      organizationId: airline1.id,
      email: 'admin@americanair.com',
      username: 'aa_admin',
      passwordHash: '$2b$10$dummyHashForDevelopment', // In production, use proper bcrypt hash
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0100',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@americanair.com' },
    update: {},
    create: {
      organizationId: airline1.id,
      email: 'agent@americanair.com',
      username: 'aa_agent',
      passwordHash: '$2b$10$dummyHashForDevelopment',
      firstName: 'Check-in',
      lastName: 'Agent',
      phone: '+1-555-0101',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Assign roles
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: agentUser.id,
      roleId: agentRole.id,
    },
  });

  console.log(`✅ Created ${2} users`);

  // ============================================================================
  // FLIGHTS
  // ============================================================================
  
  console.log('🛫 Creating flights...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const arrivalTime = new Date(tomorrow);
  arrivalTime.setHours(13, 30, 0, 0);

  const flight1 = await prisma.flight.create({
    data: {
      organizationId: airline1.id,
      flightNumber: 'AA100',
      operatingCarrier: 'AA',
      marketingCarrier: 'AA',
      origin: 'JFK',
      destination: 'LAX',
      scheduledDeparture: tomorrow,
      scheduledArrival: arrivalTime,
      aircraftType: 'Boeing 737-800',
      aircraftRegistration: 'N12345',
      tailNumber: 'AA100',
      totalSeats: 160,
      economySeats: 120,
      premiumEconomySeats: 20,
      businessSeats: 20,
      firstSeats: 0,
      status: 'SCHEDULED',
      gate: 'B12',
      terminal: '4',
    },
  });

  const flight2Tomorrow = new Date(tomorrow);
  flight2Tomorrow.setHours(14, 0, 0, 0);
  const flight2Arrival = new Date(flight2Tomorrow);
  flight2Arrival.setHours(16, 45, 0, 0);

  const flight2 = await prisma.flight.create({
    data: {
      organizationId: airline2.id,
      flightNumber: 'DL200',
      operatingCarrier: 'DL',
      marketingCarrier: 'DL',
      origin: 'ATL',
      destination: 'ORD',
      scheduledDeparture: flight2Tomorrow,
      scheduledArrival: flight2Arrival,
      aircraftType: 'Airbus A320',
      aircraftRegistration: 'N54321',
      tailNumber: 'DL200',
      totalSeats: 150,
      economySeats: 120,
      premiumEconomySeats: 0,
      businessSeats: 30,
      firstSeats: 0,
      status: 'SCHEDULED',
      gate: 'C5',
      terminal: 'S',
    },
  });

  console.log(`✅ Created ${2} flights`);

  // ============================================================================
  // FLIGHT INVENTORY
  // ============================================================================
  
  console.log('💺 Creating flight inventory...');

  const inventory = await prisma.flightInventory.createMany({
    data: [
      // Flight 1 - AA100
      {
        flightId: flight1.id,
        cabinClass: 'ECONOMY',
        bookingClass: 'Y',
        totalSeats: 120,
        availableSeats: 85,
        bookedSeats: 35,
        baseFare: 299.00,
        isAvailable: true,
      },
      {
        flightId: flight1.id,
        cabinClass: 'PREMIUM_ECONOMY',
        bookingClass: 'W',
        totalSeats: 20,
        availableSeats: 12,
        bookedSeats: 8,
        baseFare: 499.00,
        isAvailable: true,
      },
      {
        flightId: flight1.id,
        cabinClass: 'BUSINESS',
        bookingClass: 'J',
        totalSeats: 20,
        availableSeats: 15,
        bookedSeats: 5,
        baseFare: 899.00,
        isAvailable: true,
      },
      // Flight 2 - DL200
      {
        flightId: flight2.id,
        cabinClass: 'ECONOMY',
        bookingClass: 'Y',
        totalSeats: 120,
        availableSeats: 90,
        bookedSeats: 30,
        baseFare: 199.00,
        isAvailable: true,
      },
      {
        flightId: flight2.id,
        cabinClass: 'BUSINESS',
        bookingClass: 'J',
        totalSeats: 30,
        availableSeats: 20,
        bookedSeats: 10,
        baseFare: 599.00,
        isAvailable: true,
      },
    ],
  });

  console.log(`✅ Created ${5} inventory entries`);

  // ============================================================================
  // FARES
  // ============================================================================
  
  console.log('💵 Creating fares...');

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const fares = await prisma.fare.createMany({
    data: [
      {
        organizationId: airline1.id,
        fareCode: 'AA-ECON-FLEX',
        fareName: 'Economy Flexible',
        fareType: 'PUBLISHED',
        origin: 'JFK',
        destination: 'LAX',
        routeType: 'ONE_WAY',
        cabinClass: 'ECONOMY',
        bookingClass: 'Y',
        fareBasis: 'YOWUS',
        baseFare: 299.00,
        refundable: true,
        changeable: true,
        changefee: 0,
        carryOnBags: 1,
        checkedBags: 2,
        baggageWeight: 23,
        validFrom: new Date(),
        validTo: nextYear,
        isActive: true,
      },
      {
        organizationId: airline1.id,
        fareCode: 'AA-ECON-SAVER',
        fareName: 'Economy Saver',
        fareType: 'PUBLISHED',
        origin: 'JFK',
        destination: 'LAX',
        routeType: 'ONE_WAY',
        cabinClass: 'ECONOMY',
        bookingClass: 'M',
        fareBasis: 'MLWUS',
        baseFare: 199.00,
        refundable: false,
        changeable: true,
        changefee: 75.00,
        carryOnBags: 1,
        checkedBags: 1,
        baggageWeight: 23,
        advancePurchaseMin: 7,
        validFrom: new Date(),
        validTo: nextYear,
        isActive: true,
      },
      {
        organizationId: airline1.id,
        fareCode: 'AA-BIZ-FLEX',
        fareName: 'Business Flexible',
        fareType: 'PUBLISHED',
        origin: 'JFK',
        destination: 'LAX',
        routeType: 'ONE_WAY',
        cabinClass: 'BUSINESS',
        bookingClass: 'J',
        fareBasis: 'JOWUS',
        baseFare: 899.00,
        refundable: true,
        changeable: true,
        changefee: 0,
        carryOnBags: 2,
        checkedBags: 3,
        baggageWeight: 32,
        validFrom: new Date(),
        validTo: nextYear,
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${3} fares`);

  // ============================================================================
  // ANCILLARY PRODUCTS
  // ============================================================================
  
  console.log('🎒 Creating ancillary products...');

  const ancillaryProducts = await prisma.ancillaryProduct.createMany({
    data: [
      // Baggage
      {
        organizationId: airline1.id,
        productCode: 'BAG-CHECKED-1',
        productName: 'First Checked Bag',
        category: 'BAGGAGE',
        basePrice: 35.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        maxQuantity: 1,
        description: 'First checked bag up to 50 lbs (23 kg)',
        shortDescription: '1st checked bag',
      },
      {
        organizationId: airline1.id,
        productCode: 'BAG-CHECKED-2',
        productName: 'Second Checked Bag',
        category: 'BAGGAGE',
        basePrice: 45.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        maxQuantity: 1,
        description: 'Second checked bag up to 50 lbs (23 kg)',
        shortDescription: '2nd checked bag',
      },
      {
        organizationId: airline1.id,
        productCode: 'BAG-OVERWEIGHT',
        productName: 'Overweight Bag',
        category: 'BAGGAGE',
        basePrice: 100.00,
        taxable: true,
        isActive: true,
        allowMultiple: true,
        maxQuantity: 10,
        description: 'Bags over 50 lbs (23 kg) up to 70 lbs (32 kg)',
        shortDescription: 'Overweight bag fee',
      },
      // Seats
      {
        organizationId: airline1.id,
        productCode: 'SEAT-EXTRA-LEGROOM',
        productName: 'Extra Legroom Seat',
        category: 'SEAT',
        basePrice: 89.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        description: 'Preferred seat with extra legroom',
        shortDescription: 'Extra legroom',
      },
      {
        organizationId: airline1.id,
        productCode: 'SEAT-PREFERRED',
        productName: 'Preferred Seat',
        category: 'SEAT',
        basePrice: 39.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        description: 'Preferred seat selection (front of cabin, aisle/window)',
        shortDescription: 'Preferred seat',
      },
      // Meals
      {
        organizationId: airline1.id,
        productCode: 'MEAL-PREMIUM',
        productName: 'Premium Meal',
        category: 'MEAL',
        basePrice: 15.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        description: 'Premium meal selection',
        shortDescription: 'Premium meal',
      },
      // Lounge
      {
        organizationId: airline1.id,
        productCode: 'LOUNGE-ACCESS',
        productName: 'Admirals Club Lounge Access',
        category: 'LOUNGE',
        basePrice: 59.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        description: 'Single-day access to Admirals Club lounge',
        shortDescription: 'Lounge access',
      },
      // Priority
      {
        organizationId: airline1.id,
        productCode: 'PRIORITY-BOARDING',
        productName: 'Priority Boarding',
        category: 'PRIORITY_BOARDING',
        basePrice: 25.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        description: 'Board in Group 1 with priority access',
        shortDescription: 'Priority boarding',
      },
      // WiFi
      {
        organizationId: airline1.id,
        productCode: 'WIFI-FLIGHT',
        productName: 'In-Flight WiFi',
        category: 'WIFI',
        basePrice: 19.00,
        taxable: true,
        isActive: true,
        allowMultiple: false,
        description: 'WiFi access for entire flight',
        shortDescription: 'WiFi',
      },
      // Insurance
      {
        organizationId: airline1.id,
        productCode: 'INSURANCE-TRIP',
        productName: 'Trip Protection Insurance',
        category: 'INSURANCE',
        basePrice: 49.00,
        taxable: false,
        isActive: true,
        allowMultiple: false,
        description: 'Comprehensive trip protection and cancellation insurance',
        shortDescription: 'Trip insurance',
      },
    ],
  });

  console.log(`✅ Created ${10} ancillary products`);

  // ============================================================================
  // SAMPLE PNR WITH PASSENGERS
  // ============================================================================
  
  console.log('📋 Creating sample PNR...');

  const pnr = await prisma.pNR.create({
    data: {
      organizationId: airline1.id,
      locator: 'ABC123',
      status: 'CONFIRMED',
      bookingChannel: 'WEB',
      contactEmail: 'john.smith@email.com',
      contactPhone: '+1-555-1234',
      contactName: 'John Smith',
      totalAmount: 698.00,
      currency: 'USD',
      paymentStatus: 'PAID',
      paidAmount: 698.00,
      bookingDate: new Date(),
    },
  });

  // PNR Segment
  const pnrSegment = await prisma.pNRSegment.create({
    data: {
      pnrId: pnr.id,
      flightId: flight1.id,
      segmentNumber: 1,
      origin: 'JFK',
      destination: 'LAX',
      departureDate: tomorrow,
      arrivalDate: arrivalTime,
      cabinClass: 'ECONOMY',
      bookingClass: 'Y',
      fareBasis: 'YOWUS',
      status: 'CONFIRMED',
    },
  });

  // Passengers
  const passenger1 = await prisma.passenger.create({
    data: {
      organizationId: airline1.id,
      pnrId: pnr.id,
      passengerType: 'ADULT',
      title: 'Mr',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'MALE',
      email: 'john.smith@email.com',
      phone: '+1-555-1234',
      frequentFlyerNumber: 'AA12345678',
      frequentFlyerTier: 'Gold',
      nationality: 'US',
    },
  });

  const passenger2 = await prisma.passenger.create({
    data: {
      organizationId: airline1.id,
      pnrId: pnr.id,
      passengerType: 'ADULT',
      title: 'Mrs',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1987-08-22'),
      gender: 'FEMALE',
      email: 'jane.smith@email.com',
      phone: '+1-555-1234',
      nationality: 'US',
    },
  });

  console.log(`✅ Created PNR ${pnr.locator} with ${2} passengers`);

  // ============================================================================
  // PAYMENT
  // ============================================================================
  
  console.log('💳 Creating payment...');

  const payment = await prisma.payment.create({
    data: {
      organizationId: airline1.id,
      pnrId: pnr.id,
      amount: 698.00,
      currency: 'USD',
      paymentMethod: 'CREDIT_CARD',
      status: 'COMPLETED',
      gatewayProvider: 'Stripe',
      gatewayTransactionId: 'ch_1234567890abcdef',
      cardType: 'Visa',
      cardLast4: '4242',
      billingName: 'John Smith',
      billingEmail: 'john.smith@email.com',
      settledAt: new Date(),
    },
  });

  console.log(`✅ Created payment for $${payment.amount}`);

  // ============================================================================
  // CUSTOMER SEGMENTS
  // ============================================================================
  
  console.log('👥 Creating customer segments...');

  const segments = await prisma.customerSegment.createMany({
    data: [
      {
        organizationId: airline1.id,
        name: 'High Value Customers',
        description: 'Customers with >$5000 annual spend',
        criteria: {
          rules: [
            { field: 'annualSpend', operator: 'gte', value: 5000 },
          ],
        },
        isActive: true,
      },
      {
        organizationId: airline1.id,
        name: 'Frequent Flyers',
        description: 'Customers with >10 flights per year',
        criteria: {
          rules: [
            { field: 'flightCount', operator: 'gte', value: 10 },
          ],
        },
        isActive: true,
      },
      {
        organizationId: airline1.id,
        name: 'Inactive Customers',
        description: 'No bookings in last 12 months',
        criteria: {
          rules: [
            { field: 'lastBookingDate', operator: 'lte', value: '12_months_ago' },
          ],
        },
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${3} customer segments`);

  // ============================================================================
  // CAMPAIGN
  // ============================================================================
  
  console.log('📢 Creating marketing campaign...');

  const campaign = await prisma.campaign.create({
    data: {
      organizationId: airline1.id,
      name: 'Summer Sale 2024',
      code: 'SUMMER2024',
      description: 'Limited time summer travel sale',
      campaignType: 'SEASONAL',
      startDate: new Date(),
      endDate: nextMonth,
      discountType: 'PERCENTAGE',
      discountPercentage: 20.00,
      budget: 100000.00,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created campaign: ${campaign.name}`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  
  console.log('\n📊 Seed Summary:');
  console.log('================');
  console.log(`✅ Organizations: 3 airlines`);
  console.log(`✅ Users: 2 users`);
  console.log(`✅ Roles: 4 roles`);
  console.log(`✅ Permissions: ${permissions.length} permissions`);
  console.log(`✅ Flights: 2 flights`);
  console.log(`✅ Inventory: 5 cabin classes`);
  console.log(`✅ Fares: 3 fare types`);
  console.log(`✅ Ancillary Products: 10 products`);
  console.log(`✅ PNRs: 1 booking with 2 passengers`);
  console.log(`✅ Payments: 1 payment`);
  console.log(`✅ Customer Segments: 3 segments`);
  console.log(`✅ Campaigns: 1 active campaign`);
  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
