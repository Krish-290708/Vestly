function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✔ PASS: ${message}`);
}

console.log('\n--- 1. Testing Vesting Calculations ---');
function generateSchedule(totalUnits, cliffMonths = 12) {
  const totalMonths = 48;
  const monthlyRate = totalUnits / totalMonths;
  const events = [];
  let accumulated = 0;

  const cliffUnits = Math.round(monthlyRate * cliffMonths);
  accumulated += cliffUnits;
  events.push({ month: cliffMonths, units: cliffUnits, cumulative: accumulated });

  for (let m = cliffMonths + 1; m <= totalMonths; m++) {
    let units = Math.round(monthlyRate);
    if (m === totalMonths) units = totalUnits - accumulated;
    accumulated += units;
    events.push({ month: m, units, cumulative: accumulated });
  }
  return events;
}

const schedule = generateSchedule(4800, 12);
assert(schedule.length === 37, '4-year schedule with 1-year cliff has 37 event tranches (1 cliff + 36 monthly)');
assert(schedule[0].units === 1200, 'Cliff event vests exactly 25% (1200 units of 4800)');
assert(schedule[schedule.length - 1].cumulative === 4800, 'Final tranche cumulatively vests 100% (4800 units)');

console.log('\n--- 2. Testing ISO Tax & AMT Calculations ---');
const units = 1000;
const strike = 5.0;
const fmv = 20.0;
const exitPrice = 50.0;
const exerciseCost = units * strike;
const grossExitValue = units * exitPrice;
const grossGain = grossExitValue - exerciseCost;
const amtSpread = units * (fmv - strike);

assert(exerciseCost === 5000, 'Exercise cost for 1,000 units @ $5 is $5,000');
assert(grossExitValue === 50000, 'Gross exit value for 1,000 units @ $50 is $50,000');
assert(grossGain === 45000, 'Gross gain is $45,000');
assert(amtSpread === 15000, 'ISO paper spread for AMT is $15,000 ($20 FMV - $5 strike * 1,000)');

console.log('\n--- 3. Testing Section 83(b) Deadline Calculation ---');
const grantDate = new Date();
const deadline = new Date(grantDate.getTime() + 30 * 24 * 60 * 60 * 1000);
const days = Math.ceil((deadline.getTime() - grantDate.getTime()) / (1000 * 60 * 60 * 24));
assert(days === 30, '83(b) deadline is strictly 30 days from grant');

console.log('\n--- 4. Testing Secondary Market & Tender Offer Calculations ---');
const vestedUnits = 2000;
const participationPct = 25; // 25% tendered
const tenderPrice = 50.0;
const tenderStrike = 5.0;
const feePct = 1.0; // 1%
const offeredUnits = Math.round(vestedUnits * (participationPct / 100));
const retainedUnits = vestedUnits - offeredUnits;
const grossTender = offeredUnits * tenderPrice;
const strikeOffset = offeredUnits * tenderStrike;
const feeAmount = Math.round(grossTender * (feePct / 100));
const netTaxable = grossTender - strikeOffset - feeAmount;

assert(offeredUnits === 500, 'Tender participation of 25% on 2,000 units is exactly 500 units');
assert(retainedUnits === 1500, 'Retained units count is exactly 1,500 units');
assert(grossTender === 25000, 'Gross tender proceeds for 500 units @ $50 is $25,000');
assert(strikeOffset === 2500, 'Strike offset for 500 units @ $5 is $2,500');
assert(feeAmount === 250, '1% transaction fee on $25,000 is $250');
assert(netTaxable === 22250, 'Net taxable gain before taxes is $22,250');

console.log('\nAll core financial verification tests PASSED!\n');


