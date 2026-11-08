/**
 * US State Tax Rates dataset (50 states + District of Columbia).
 * Provides top marginal individual income tax rate and capital gains treatment.
 */

export interface StateTaxRate {
  code: string;
  name: string;
  incomeTaxRate: number; // Decimal (e.g. 0.093 for 9.3%)
  capitalGainsRate: number; // Decimal (usually equal to ordinary income rate in most states)
  hasNoIncomeTax: boolean;
}

export const US_STATE_TAX_RATES: Record<string, StateTaxRate> = {
  AL: { code: 'AL', name: 'Alabama', incomeTaxRate: 0.05, capitalGainsRate: 0.05, hasNoIncomeTax: false },
  AK: { code: 'AK', name: 'Alaska', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  AZ: { code: 'AZ', name: 'Arizona', incomeTaxRate: 0.025, capitalGainsRate: 0.025, hasNoIncomeTax: false },
  AR: { code: 'AR', name: 'Arkansas', incomeTaxRate: 0.044, capitalGainsRate: 0.044, hasNoIncomeTax: false },
  CA: { code: 'CA', name: 'California', incomeTaxRate: 0.133, capitalGainsRate: 0.133, hasNoIncomeTax: false },
  CO: { code: 'CO', name: 'Colorado', incomeTaxRate: 0.044, capitalGainsRate: 0.044, hasNoIncomeTax: false },
  CT: { code: 'CT', name: 'Connecticut', incomeTaxRate: 0.0699, capitalGainsRate: 0.0699, hasNoIncomeTax: false },
  DE: { code: 'DE', name: 'Delaware', incomeTaxRate: 0.066, capitalGainsRate: 0.066, hasNoIncomeTax: false },
  DC: { code: 'DC', name: 'District of Columbia', incomeTaxRate: 0.1075, capitalGainsRate: 0.1075, hasNoIncomeTax: false },
  FL: { code: 'FL', name: 'Florida', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  GA: { code: 'GA', name: 'Georgia', incomeTaxRate: 0.0549, capitalGainsRate: 0.0549, hasNoIncomeTax: false },
  HI: { code: 'HI', name: 'Hawaii', incomeTaxRate: 0.11, capitalGainsRate: 0.0725, hasNoIncomeTax: false },
  ID: { code: 'ID', name: 'Idaho', incomeTaxRate: 0.058, capitalGainsRate: 0.058, hasNoIncomeTax: false },
  IL: { code: 'IL', name: 'Illinois', incomeTaxRate: 0.0495, capitalGainsRate: 0.0495, hasNoIncomeTax: false },
  IN: { code: 'IN', name: 'Indiana', incomeTaxRate: 0.0305, capitalGainsRate: 0.0305, hasNoIncomeTax: false },
  IA: { code: 'IA', name: 'Iowa', incomeTaxRate: 0.057, capitalGainsRate: 0.057, hasNoIncomeTax: false },
  KS: { code: 'KS', name: 'Kansas', incomeTaxRate: 0.057, capitalGainsRate: 0.057, hasNoIncomeTax: false },
  KY: { code: 'KY', name: 'Kentucky', incomeTaxRate: 0.04, capitalGainsRate: 0.04, hasNoIncomeTax: false },
  LA: { code: 'LA', name: 'Louisiana', incomeTaxRate: 0.0425, capitalGainsRate: 0.0425, hasNoIncomeTax: false },
  ME: { code: 'ME', name: 'Maine', incomeTaxRate: 0.0715, capitalGainsRate: 0.0715, hasNoIncomeTax: false },
  MD: { code: 'MD', name: 'Maryland', incomeTaxRate: 0.0575, capitalGainsRate: 0.0575, hasNoIncomeTax: false },
  MA: { code: 'MA', name: 'Massachusetts', incomeTaxRate: 0.09, capitalGainsRate: 0.085, hasNoIncomeTax: false },
  MI: { code: 'MI', name: 'Michigan', incomeTaxRate: 0.0425, capitalGainsRate: 0.0425, hasNoIncomeTax: false },
  MN: { code: 'MN', name: 'Minnesota', incomeTaxRate: 0.0985, capitalGainsRate: 0.0985, hasNoIncomeTax: false },
  MS: { code: 'MS', name: 'Mississippi', incomeTaxRate: 0.047, capitalGainsRate: 0.047, hasNoIncomeTax: false },
  MO: { code: 'MO', name: 'Missouri', incomeTaxRate: 0.048, capitalGainsRate: 0.048, hasNoIncomeTax: false },
  MT: { code: 'MT', name: 'Montana', incomeTaxRate: 0.059, capitalGainsRate: 0.041, hasNoIncomeTax: false },
  NE: { code: 'NE', name: 'Nebraska', incomeTaxRate: 0.0584, capitalGainsRate: 0.0584, hasNoIncomeTax: false },
  NV: { code: 'NV', name: 'Nevada', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  NH: { code: 'NH', name: 'New Hampshire', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  NJ: { code: 'NJ', name: 'New Jersey', incomeTaxRate: 0.1075, capitalGainsRate: 0.1075, hasNoIncomeTax: false },
  NM: { code: 'NM', name: 'New Mexico', incomeTaxRate: 0.059, capitalGainsRate: 0.059, hasNoIncomeTax: false },
  NY: { code: 'NY', name: 'New York', incomeTaxRate: 0.109, capitalGainsRate: 0.109, hasNoIncomeTax: false },
  NC: { code: 'NC', name: 'North Carolina', incomeTaxRate: 0.045, capitalGainsRate: 0.045, hasNoIncomeTax: false },
  ND: { code: 'ND', name: 'North Dakota', incomeTaxRate: 0.025, capitalGainsRate: 0.025, hasNoIncomeTax: false },
  OH: { code: 'OH', name: 'Ohio', incomeTaxRate: 0.035, capitalGainsRate: 0.035, hasNoIncomeTax: false },
  OK: { code: 'OK', name: 'Oklahoma', incomeTaxRate: 0.0475, capitalGainsRate: 0.0475, hasNoIncomeTax: false },
  OR: { code: 'OR', name: 'Oregon', incomeTaxRate: 0.099, capitalGainsRate: 0.099, hasNoIncomeTax: false },
  PA: { code: 'PA', name: 'Pennsylvania', incomeTaxRate: 0.0307, capitalGainsRate: 0.0307, hasNoIncomeTax: false },
  RI: { code: 'RI', name: 'Rhode Island', incomeTaxRate: 0.0599, capitalGainsRate: 0.0599, hasNoIncomeTax: false },
  SC: { code: 'SC', name: 'South Carolina', incomeTaxRate: 0.064, capitalGainsRate: 0.044, hasNoIncomeTax: false },
  SD: { code: 'SD', name: 'South Dakota', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  TN: { code: 'TN', name: 'Tennessee', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  TX: { code: 'TX', name: 'Texas', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
  UT: { code: 'UT', name: 'Utah', incomeTaxRate: 0.0465, capitalGainsRate: 0.0465, hasNoIncomeTax: false },
  VT: { code: 'VT', name: 'Vermont', incomeTaxRate: 0.0875, capitalGainsRate: 0.0875, hasNoIncomeTax: false },
  VA: { code: 'VA', name: 'Virginia', incomeTaxRate: 0.0575, capitalGainsRate: 0.0575, hasNoIncomeTax: false },
  WA: { code: 'WA', name: 'Washington', incomeTaxRate: 0.0, capitalGainsRate: 0.07, hasNoIncomeTax: true },
  WV: { code: 'WV', name: 'West Virginia', incomeTaxRate: 0.0512, capitalGainsRate: 0.0512, hasNoIncomeTax: false },
  WI: { code: 'WI', name: 'Wisconsin', incomeTaxRate: 0.0765, capitalGainsRate: 0.0535, hasNoIncomeTax: false },
  WY: { code: 'WY', name: 'Wyoming', incomeTaxRate: 0.0, capitalGainsRate: 0.0, hasNoIncomeTax: true },
};

export const STATE_OPTIONS = Object.values(US_STATE_TAX_RATES)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((st) => ({
    value: st.code,
    label: `${st.name} (${(st.incomeTaxRate * 100).toFixed(1)}% / Cap: ${(st.capitalGainsRate * 100).toFixed(1)}%)`,
  }));

export function getStateRates(stateCode: string): StateTaxRate {
  return US_STATE_TAX_RATES[stateCode] || US_STATE_TAX_RATES['CA'];
}

