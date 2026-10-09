'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface Section83bModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: number;
  currentFmv: number;
  strikePrice: number;
  selectedGrant?: {
    company?: { name?: string };
    grantDate?: string | Date;
  } | null;
}

export default function Section83bModal({
  isOpen,
  onClose,
  units,
  currentFmv,
  strikePrice,
  selectedGrant,
}: Section83bModalProps) {
  if (!isOpen) return null;

  const companyName = selectedGrant?.company?.name || '[Company Name]';
  const grantDate = new Date(selectedGrant?.grantDate || Date.now()).toLocaleDateString();
  const totalFmv = (units * currentFmv).toLocaleString();
  const totalPaid = (units * strikePrice).toLocaleString();
  const grossIncome = Math.max(0, units * (currentFmv - strikePrice)).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden my-8 space-y-6 p-6 sm:p-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">IRS Section 83(b) Election Template</h3>
            <p className="text-xs text-slate-400">Ready-to-print certified election notice</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Letter Content */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono space-y-4 text-slate-200 leading-relaxed overflow-y-auto max-h-[60vh]">
          <div>
            <strong className="text-white">DEPARTMENT OF THE TREASURY</strong><br />
            INTERNAL REVENUE SERVICE CENTER<br />
            (Mail to IRS Service Center where you file Form 1040)
          </div>

          <div>
            <strong className="text-emerald-400">SUBJECT: ELECTION PURSUANT TO SECTION 83(b) OF THE INTERNAL REVENUE CODE</strong>
          </div>

          <p>
            The undersigned taxpayer hereby elects, pursuant to Section 83(b) of the Internal Revenue Code of 1986, as amended, to include in gross income the excess (if any) of the fair market value of the property described below over the amount paid for such property.
          </p>

          <div>
            <strong className="text-slate-300">1. Taxpayer Information:</strong><br />
            Name: [Taxpayer Full Name]<br />
            Address: [Taxpayer Home Address]<br />
            Social Security Number: [Taxpayer SSN]
          </div>

          <div>
            <strong className="text-slate-300">2. Description of Property:</strong><br />
            {units.toLocaleString()} shares of Common Stock of {companyName}, a Delaware corporation.
          </div>

          <div>
            <strong className="text-slate-300">3. Date Property Transferred:</strong><br />
            {grantDate}
          </div>

          <div>
            <strong className="text-slate-300">4. Restrictions to Which Property is Subject:</strong><br />
            The shares are subject to vesting and a repurchase option in favor of the Company upon termination of employment or service.
          </div>

          <div>
            <strong className="text-slate-300">5. Fair Market Value at Time of Transfer:</strong><br />
            ${totalFmv} (${currentFmv.toFixed(2)} per share).
          </div>

          <div>
            <strong className="text-slate-300">6. Amount Paid for Property:</strong><br />
            ${totalPaid} (${strikePrice.toFixed(2)} per share).
          </div>

          <div>
            <strong className="text-slate-300">7. Gross Income Recognized:</strong><br />
            ${grossIncome}.
          </div>

          <div className="pt-4 text-slate-300">
            Dated: {new Date().toLocaleDateString()}<br /><br />
            ________________________________________<br />
            Taxpayer Signature
          </div>
        </div>
      </div>
    </div>
  );
}

