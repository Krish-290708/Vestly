const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@vestly.app';
const PRIVATE_NOTE = ' Sample figures for demonstration only; not a 409A valuation.';
const PUBLIC_NOTE = ' Sample price for demonstration; live quotes replace it when a market-data key is set.';

async function main() {
  // This script clears every table. Refuse to run if real accounts exist, unless told to.
  const otherUsers = await prisma.user.count({ where: { email: { not: DEMO_EMAIL } } });
  if (otherUsers > 0 && process.env.SEED_FORCE !== '1') {
    console.error(
      `Refusing to seed: ${otherUsers} non-demo account(s) exist and seeding would delete them.\n` +
      'Back up your database, then re-run with SEED_FORCE=1 if you really want a clean slate.'
    );
    process.exit(1);
  }

  console.log('Clearing existing records...');
  await prisma.savedScenario.deleteMany();
  await prisma.learnProgress.deleteMany();
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
      description: 'Global financial infrastructure platform powering digital commerce and enterprise billing.' + PRIVATE_NOTE,
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
      description: 'Data intelligence platform unifying analytics, engineering, and enterprise AI models.' + PRIVATE_NOTE,
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
      isPublic: true,
      sector: 'Design & Collaboration',
      description: 'Collaborative design platform for product design and interactive prototyping. Listed on the NYSE since July 2025.' + PUBLIC_NOTE,
      foundedYear: 2012,
      keyLeadership: 'Dylan Field (CEO & Co-founder)',
      fundingHistory: 'Public (NYSE: FIG). Earlier private tender offer valued the company at $12.5B in 2024.',
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
      description: 'Designs and sells consumer electronics, operating systems, and online services worldwide.' + PUBLIC_NOTE,
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
      description: 'Accelerated computing company powering the global generative AI infrastructure.' + PUBLIC_NOTE,
      foundedYear: 1993,
      keyLeadership: 'Jensen Huang (CEO & Founder)',
      fundingHistory: 'Public (NASDAQ: NVDA)',
      latestValuation: 2950000000000,
      latestFmvPerShare: 120.80,
      lastFmvUpdateDate: new Date(),
    }
  });

  const notion = await prisma.company.create({
    data: {
      name: 'Notion',
      ticker: null,
      isPublic: false,
      sector: 'Productivity & Collaboration',
      description: 'Connected workspace for notes, documents, wikis and project tracking.' + PRIVATE_NOTE,
      foundedYear: 2013,
      keyLeadership: 'Ivan Zhao (CEO & Co-founder)',
      fundingHistory: 'Private; round details not included in sample data.',
      latestValuation: 10000000000,
      latestFmvPerShare: 18.00,
      lastFmvUpdateDate: new Date('2024-09-01'),
    }
  });

  const rippling = await prisma.company.create({
    data: {
      name: 'Rippling',
      ticker: null,
      isPublic: false,
      sector: 'HR & Workforce Software',
      description: 'Workforce platform combining payroll, benefits, IT and device management.' + PRIVATE_NOTE,
      foundedYear: 2016,
      keyLeadership: 'Parker Conrad (CEO & Co-founder)',
      fundingHistory: 'Private; round details not included in sample data.',
      latestValuation: 15000000000,
      latestFmvPerShare: 31.00,
      lastFmvUpdateDate: new Date('2024-10-01'),
    }
  });

  const airbnb = await prisma.company.create({
    data: {
      name: 'Airbnb, Inc.',
      ticker: 'ABNB',
      isPublic: true,
      sector: 'Travel & Marketplaces',
      description: 'Online marketplace for short-term stays and experiences.' + PUBLIC_NOTE,
      foundedYear: 2008,
      keyLeadership: 'Brian Chesky (CEO & Co-founder)',
      fundingHistory: 'Public (NASDAQ: ABNB)',
      latestValuation: 85000000000,
      latestFmvPerShare: 135.00,
      lastFmvUpdateDate: new Date(),
    }
  });

  const microsoft = await prisma.company.create({
    data: {
      name: 'Microsoft Corporation',
      ticker: 'MSFT',
      isPublic: true,
      sector: 'Enterprise Software & Cloud',
      description: 'Software, cloud computing and productivity products for consumers and enterprises.' + PUBLIC_NOTE,
      foundedYear: 1975,
      keyLeadership: 'Satya Nadella (CEO)',
      fundingHistory: 'Public (NASDAQ: MSFT)',
      latestValuation: 3100000000000,
      latestFmvPerShare: 420.00,
      lastFmvUpdateDate: new Date(),
    }
  });

  const snowflake = await prisma.company.create({
    data: {
      name: 'Snowflake Inc.',
      ticker: 'SNOW',
      isPublic: true,
      sector: 'Data & Cloud',
      description: 'Cloud data platform for warehousing, sharing and analytics.' + PUBLIC_NOTE,
      foundedYear: 2012,
      keyLeadership: 'Sridhar Ramaswamy (CEO)',
      fundingHistory: 'Public (NYSE: SNOW)',
      latestValuation: 50000000000,
      latestFmvPerShare: 150.00,
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
      filingStatus: 'SINGLE',
      stateCode: 'CA',
      annualIncome: 185000,
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

  // Grant 4: Notion ISOs (older grant, mostly vested)
  const grant4 = await prisma.grant.create({
    data: {
      userId: demoUser.id,
      companyId: notion.id,
      grantIdentifier: 'NOTION-ISO-2021',
      grantType: 'ISO',
      unitsGranted: 8000,
      strikePrice: 3.20,
      grantDate: new Date('2021-09-01'),
      vestingStartDate: new Date('2021-09-01'),
      cliffMonths: 12,
      vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
      expirationDate: new Date('2031-09-01'),
      status: 'VESTING',
      earlyExercisable: false,
      notes: 'Early-stage engineering grant. Low strike, large spread to current sample FMV.',
    }
  });

  // Grant 5: Airbnb RSUs (public company)
  const grant5 = await prisma.grant.create({
    data: {
      userId: demoUser.id,
      companyId: airbnb.id,
      grantIdentifier: 'ABNB-RSU-2023',
      grantType: 'RSU',
      unitsGranted: 1600,
      strikePrice: 0.00,
      grantDate: new Date('2023-02-01'),
      vestingStartDate: new Date('2023-02-01'),
      cliffMonths: 12,
      vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
      expirationDate: new Date('2030-02-01'),
      status: 'VESTING',
      earlyExercisable: false,
      notes: 'Public-company RSUs. Taxed as income at vest, so basis equals the vest-date price.',
    }
  });

  // Grant 6: Rippling NSOs (recent, underwater-risk case for comparison)
  const grant6 = await prisma.grant.create({
    data: {
      userId: demoUser.id,
      companyId: rippling.id,
      grantIdentifier: 'RIPPLING-NSO-2024',
      grantType: 'NSO',
      unitsGranted: 3000,
      strikePrice: 29.50,
      grantDate: new Date('2024-10-01'),
      vestingStartDate: new Date('2024-10-01'),
      cliffMonths: 12,
      vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
      expirationDate: new Date('2034-10-01'),
      status: 'VESTING',
      earlyExercisable: false,
      notes: 'Strike is close to current sample FMV, so the spread is small. Good case for the break-even tool.',
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

  const events4 = createVestingEventsForGrant(grant4.id, 8000, new Date('2021-09-01'), '4_YEAR_1_YEAR_CLIFF', 12);
  const events5 = createVestingEventsForGrant(grant5.id, 1600, new Date('2023-02-01'), '4_YEAR_1_YEAR_CLIFF', 12);
  const events6 = createVestingEventsForGrant(grant6.id, 3000, new Date('2024-10-01'), '4_YEAR_1_YEAR_CLIFF', 12);

  for (const e of [...events1, ...events2, ...events3, ...events4, ...events5, ...events6]) {
    await prisma.vestingEvent.create({ data: e });
  }

  console.log('Seeding Action Reminders...');
  const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
  };
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
      {
        userId: demoUser.id, grantId: grant4.id, type: 'EXPIRATION_WARNING',
        title: 'Notion ISO: review exercise plan before AMT year-end',
        description: 'Large spread on 8,000 ISOs. Model the AMT cost of exercising this year versus next.',
        dueDate: daysFromNow(35), status: 'PENDING', urgency: 'HIGH',
      },
      {
        userId: demoUser.id, grantId: grant5.id, type: 'VESTING_EVENT',
        title: 'Airbnb RSU quarterly vest',
        description: 'Withholding is usually below your marginal rate. Check whether you owe more at filing.',
        dueDate: daysFromNow(21), status: 'PENDING', urgency: 'MEDIUM',
      },
      {
        userId: demoUser.id, grantId: grant6.id, type: 'ANNUAL_REVIEW',
        title: 'Rippling NSO: compare strike to latest 409A',
        description: 'Strike is close to FMV. Re-check the break-even exit price after the next 409A update.',
        dueDate: daysFromNow(60), status: 'PENDING', urgency: 'LOW',
      },
      {
        userId: demoUser.id, grantId: grant3.id, type: 'VESTING_EVENT',
        title: 'Figma RSU monthly vest',
        description: 'Now a public stock, so sell-or-hold decisions follow the live price.',
        dueDate: daysFromNow(10), status: 'PENDING', urgency: 'MEDIUM',
      },
      {
        userId: demoUser.id, grantId: grant1.id, type: 'ANNUAL_REVIEW',
        title: 'Annual equity review: update tax assumptions',
        description: 'Refresh filing status, state and income in Settings so the calculators use current numbers.',
        dueDate: daysFromNow(90), status: 'SNOOZED', snoozedUntil: daysFromNow(30), urgency: 'LOW',
      },
      {
        userId: demoUser.id, grantId: grant2.id, type: 'VESTING_EVENT',
        title: 'Databricks cliff vest recorded',
        description: 'First-year cliff tranche vested and recorded.',
        dueDate: daysFromNow(-120), status: 'COMPLETED', urgency: 'MEDIUM',
      },
      {
        userId: demoUser.id, grantId: grant1.id, type: 'ELECTION_83B',
        title: '83(b) election filed for 2022 early exercise',
        description: 'Certified mail receipt stored with the grant document.',
        dueDate: daysFromNow(-900), status: 'COMPLETED', urgency: 'CRITICAL',
      },
      {
        userId: demoUser.id, grantId: grant4.id, type: 'VESTING_EVENT',
        title: 'Notion ISO monthly vest (167 units)',
        description: 'Monthly tranche for NOTION-ISO-2021.',
        dueDate: daysFromNow(5), status: 'PENDING', urgency: 'LOW',
      },
      {
        userId: demoUser.id, grantId: grant6.id, type: 'PTEW_EXPIRATION',
        title: 'Rippling post-termination window: confirm length',
        description: 'Ask HR whether the window is 90 days or extended. It decides how long you can wait to exercise if you leave.',
        dueDate: daysFromNow(45), status: 'PENDING', urgency: 'MEDIUM',
      },
    ]
  });

  console.log('Seeding Watchlist...');
  await prisma.watchlistItem.createMany({
    data: [
      { userId: demoUser.id, companyId: stripe.id, note: 'Primary employer holding. Watching for 409A updates.' },
      { userId: demoUser.id, companyId: databricks.id, note: 'Advisory grant holding. Watching for liquidity event.' },
      { userId: demoUser.id, companyId: apple.id, note: 'Public benchmark for consumer technology peers.' },
      { userId: demoUser.id, companyId: nvidia.id, note: 'Hardware and AI valuation benchmark.' },
      { userId: demoUser.id, companyId: notion.id, note: 'Holding ISOs. Watching for a tender offer.' },
      { userId: demoUser.id, companyId: snowflake.id, note: 'Public peer for data-platform valuation multiples.' },
    ]
  });

  console.log('Seeding Saved Scenarios...');
  await prisma.savedScenario.createMany({
    data: [
      {
        userId: demoUser.id,
        grantId: grant1.id,
        name: 'Stripe 2026 Bull Case ($65 Exit)',
        kind: 'STRATEGY',
        inputs: JSON.stringify({ exitPrice: 65, units: 6000, strategy: 'exercise_and_hold' }),
      },
      {
        userId: demoUser.id,
        grantId: grant2.id,
        name: 'Databricks Cashless at IPO ($95)',
        kind: 'CALCULATOR',
        inputs: JSON.stringify({ exitPrice: 95, units: 4000, filingStatus: 'SINGLE', stateCode: 'CA' }),
      },
    ]
  });

  console.log('Seeding Learn Progress...');
  await prisma.learnProgress.createMany({
    data: [
      { userId: demoUser.id, slug: 'evaluating-an-offer' },
      { userId: demoUser.id, slug: 'iso-vs-nso-vs-rsu-vs-espp' },
      { userId: demoUser.id, slug: 'early-exercise-and-83b' },
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
      {
        userId: demoUser.id,
        grantId: grant4.id,
        action: 'GRANT_IMPORTED',
        details: 'Imported NOTION-ISO-2021 (8,000 units @ $3.20/share)',
        timestamp: new Date('2021-09-02'),
      },
      {
        userId: demoUser.id,
        grantId: grant5.id,
        action: 'GRANT_IMPORTED',
        details: 'Imported ABNB-RSU-2023 (1,600 units)',
        timestamp: new Date('2023-02-02'),
      },
      {
        userId: demoUser.id,
        grantId: grant6.id,
        action: 'GRANT_IMPORTED',
        details: 'Imported RIPPLING-NSO-2024 (3,000 units @ $29.50/share)',
        timestamp: new Date('2024-10-02'),
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

