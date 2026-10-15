const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing records...');
  await prisma.actionReminder.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.exerciseEvent.deleteMany();
  await prisma.vestingEvent.deleteMany();
  await prisma.watchlistItem.deleteMany();
  await prisma.grant.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Companies...');
  const stripe = await prisma.company.create({
    data: {
      name: 'Stripe',
      ticker: 'STRIP',
      isPublic: false,
      sector: 'Fintech & Payments',
      description: 'Global financial infrastructure platform powering digital commerce and enterprise billing.',
      foundedYear: 2010,
      keyLeadership: 'Patrick Collison (CEO), John Collison (President)',
      fundingHistory: 'Series I ($6.5B raised at $50B valuation; prior $95B peak)',
      latestValuation: 65000000000,
      latestFmvPerShare: 26.50,
      lastFmvUpdateDate: new Date('2024-03-01'),
    }
  });

  const databricks = await prisma.company.create({
    data: {
      name: 'Databricks',
      ticker: 'DATA',
      isPublic: false,
      sector: 'Data & Artificial Intelligence',
      description: 'Data intelligence platform unifying analytics, engineering, and enterprise AI models.',
      foundedYear: 2013,
      keyLeadership: 'Ali Ghodsi (CEO & Co-founder), Matei Zaharia (CTO)',
      fundingHistory: 'Series I ($500M at $43B valuation led by T. Rowe Price)',
      latestValuation: 43000000000,
      latestFmvPerShare: 73.50,
      lastFmvUpdateDate: new Date('2024-05-15'),
    }
  });

  const figma = await prisma.company.create({
    data: {
      name: 'Figma',
      ticker: 'FIG',
      isPublic: false,
      sector: 'Design & Collaboration',
      description: 'Leading collaborative design platform enabling product design and interactive prototyping.',
      foundedYear: 2012,
      keyLeadership: 'Dylan Field (CEO & Co-founder)',
      fundingHistory: 'Valued at $12.5B in 2024 employee tender offer following Adobe agreement termination',
      latestValuation: 12500000000,
      latestFmvPerShare: 32.00,
      lastFmvUpdateDate: new Date('2024-06-01'),
    }
  });

  const apple = await prisma.company.create({
    data: {
      name: 'Apple Inc.',
      ticker: 'AAPL',
      isPublic: true,
      sector: 'Consumer Technology',
      description: 'Designs and sells consumer electronics, operating systems, and online services worldwide.',
      foundedYear: 1976,
      keyLeadership: 'Tim Cook (CEO), Luca Maestri (CFO)',
      fundingHistory: 'Public (NASDAQ: AAPL)',
      latestValuation: 3450000000000,
      latestFmvPerShare: 228.50,
      lastFmvUpdateDate: new Date(),
    }
  });

  const nvidia = await prisma.company.create({
    data: {
      name: 'NVIDIA Corporation',
      ticker: 'NVDA',
      isPublic: true,
      sector: 'Semiconductors & AI Hardware',
      description: 'Accelerated computing company powering the global generative AI infrastructure.',
      foundedYear: 1993,
      keyLeadership: 'Jensen Huang (CEO & Founder)',
      fundingHistory: 'Public (NASDAQ: NVDA)',
      latestValuation: 2950000000000,
      latestFmvPerShare: 120.80,
      lastFmvUpdateDate: new Date(),
    }
  });

  console.log('Seeding Demo User...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'demo@vestly.app',
      passwordHash,
      emailAlerts: true,
      inAppAlerts: true,
      advanceReminderDays: 14,
    }
  });

  console.log('Seeding Grants for Demo User...');
  // Grant 1: Stripe ISOs
  const grant1 = await prisma.grant.create({
    data: {
      userId: demoUser.id,
      companyId: stripe.id,
      grantIdentifier: 'STRIPE-ISO-2022-A',
      grantType: 'ISO',
      unitsGranted: 12000,
      strikePrice: 8.50,
      grantDate: new Date('2022-03-15'),
      vestingStartDate: new Date('2022-03-15'),
      cliffMonths: 12,
      vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
      expirationDate: new Date('2032-03-15'),
      status: 'VESTING',
      earlyExercisable: true,
      documentName: 'Stripe_Stock_Option_Agreement_2022.pdf',
      notes: 'Initial engineering equity grant. 1-year cliff successfully reached March 2023.',
    }
  });

  // Grant 2: Databricks NSOs
  const grant2 = await prisma.grant.create({
    data: {
      userId: demoUser.id,
      companyId: databricks.id,
      grantIdentifier: 'DATA-NSO-2023-REFRESH',
      grantType: 'NSO',
      unitsGranted: 4000,
      strikePrice: 45.00,
      grantDate: new Date('2023-06-01'),
      vestingStartDate: new Date('2023-06-01'),
      cliffMonths: 12,
      vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
      expirationDate: new Date('2033-06-01'),
      status: 'VESTING',
      earlyExercisable: false,
      documentName: 'Databricks_Refresh_Grant_2023.pdf',
      notes: 'Senior tech lead annual performance refresh grant.',
    }
  });

  // Grant 3: Figma RSUs
  const grant3 = await prisma.grant.create({
    data: {
      userId: demoUser.id,
      companyId: figma.id,
      grantIdentifier: 'FIGMA-RSU-2024',
      grantType: 'RSU',
      unitsGranted: 2400,
      strikePrice: 0.00,
      grantDate: new Date('2024-01-15'),
      vestingStartDate: new Date('2024-01-15'),
      cliffMonths: 0,
      vestingSchedule: '3_YEAR_MONTHLY',
      expirationDate: new Date('2031-01-15'),
      status: 'VESTING',
      earlyExercisable: false,
      documentName: 'Figma_RSU_Agreement_2024.pdf',
      notes: 'Product retention equity grant with monthly vest.',
    }
  });

  // Helper to generate monthly vesting events
  function createVestingEventsForGrant(grantId, totalUnits, startDate, schedule, cliffMonths) {
    const events = [];
    const asOf = new Date();

    if (schedule === '4_YEAR_1_YEAR_CLIFF') {
      const totalMonths = 48;
      const monthlyRate = totalUnits / totalMonths;
      let cumulative = 0;

      // Cliff event (month 12)
      const cliffDate = new Date(startDate);
      cliffDate.setMonth(cliffDate.getMonth() + cliffMonths);
      const cliffUnits = Math.round(monthlyRate * cliffMonths);
      cumulative += cliffUnits;

      events.push({
        grantId,
        vestDate: cliffDate,
        unitsVested: cliffUnits,
        cumulativeVested: cumulative,
        isVested: cliffDate <= asOf,
      });

      // Subsequent months
      for (let m = cliffMonths + 1; m <= totalMonths; m++) {
        const vDate = new Date(startDate);
        vDate.setMonth(vDate.getMonth() + m);
        let units = Math.round(monthlyRate);
        if (m === totalMonths) units = totalUnits - cumulative;
        cumulative += units;

        events.push({
          grantId,
          vestDate: vDate,
          unitsVested: units,
          cumulativeVested: cumulative,
          isVested: vDate <= asOf,
        });
      }
    } else {
      // 3-year monthly
      const totalMonths = 36;
      const monthlyRate = totalUnits / totalMonths;
      let cumulative = 0;

      for (let m = 1; m <= totalMonths; m++) {
        const vDate = new Date(startDate);
        vDate.setMonth(vDate.getMonth() + m);
        let units = Math.round(monthlyRate);
        if (m === totalMonths) units = totalUnits - cumulative;
        cumulative += units;

        events.push({
          grantId,
          vestDate: vDate,
          unitsVested: units,
          cumulativeVested: cumulative,
          isVested: vDate <= asOf,
        });
      }
    }
    return events;
  }

  console.log('Seeding Vesting Events...');
  const events1 = createVestingEventsForGrant(grant1.id, 12000, new Date('2022-03-15'), '4_YEAR_1_YEAR_CLIFF', 12);
  const events2 = createVestingEventsForGrant(grant2.id, 4000, new Date('2023-06-01'), '4_YEAR_1_YEAR_CLIFF', 12);
  const events3 = createVestingEventsForGrant(grant3.id, 2400, new Date('2024-01-15'), '3_YEAR_MONTHLY', 0);

  for (const e of [...events1, ...events2, ...events3]) {
    await prisma.vestingEvent.create({ data: e });
  }

  console.log('Seeding Action Reminders...');
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 14);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const urgent83b = new Date();
  urgent83b.setDate(urgent83b.getDate() + 8);

  await prisma.actionReminder.createMany({
    data: [
      {
        userId: demoUser.id,
        grantId: grant1.id,
        type: 'VESTING_EVENT',
        title: 'Upcoming Stripe ISO Monthly Vest (250 units)',
        description: 'Scheduled monthly tranche for STRIPE-ISO-2022-A vests into your account.',
        dueDate: nextMonth,
        status: 'PENDING',
        urgency: 'MEDIUM',
      },
      {
        userId: demoUser.id,
        grantId: grant2.id,
        type: 'PTEW_EXPIRATION',
        title: 'Databricks PTEW Policy Review',
        description: 'Verify Databricks 90-day post-termination window vs extended 7-year option policy.',
        dueDate: nextWeek,
        status: 'PENDING',
        urgency: 'HIGH',
      },
      {
        userId: demoUser.id,
        grantId: grant1.id,
        type: 'ELECTION_83B',
        title: 'IRS Section 83(b) Deadline: Stripe Early Exercise Tranche',
        description: 'Must file 83(b) election letter via USPS certified mail within 30 days of unvested purchase.',
        dueDate: urgent83b,
        status: 'PENDING',
        urgency: 'CRITICAL',
      },
    ]
  });

  console.log('Seeding Watchlist...');
  await prisma.watchlistItem.createMany({
    data: [
      { userId: demoUser.id, companyId: stripe.id },
      { userId: demoUser.id, companyId: databricks.id },
      { userId: demoUser.id, companyId: apple.id },
      { userId: demoUser.id, companyId: nvidia.id },
    ]
  });

  console.log('Seeding Audit Log...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: demoUser.id,
        grantId: grant1.id,
        action: 'GRANT_IMPORTED',
        details: 'Imported STRIPE-ISO-2022-A (12,000 units @ $8.50/share)',
        timestamp: new Date('2022-03-15'),
      },
      {
        userId: demoUser.id,
        grantId: grant1.id,
        action: 'DOCUMENT_ATTACHED',
        details: 'Attached Stripe_Stock_Option_Agreement_2022.pdf',
        timestamp: new Date('2022-03-16'),
      },
      {
        userId: demoUser.id,
        grantId: grant2.id,
        action: 'GRANT_IMPORTED',
        details: 'Imported DATA-NSO-2023-REFRESH (4,000 units @ $45.00/share)',
        timestamp: new Date('2023-06-01'),
      },
    ]
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

