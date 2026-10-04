import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 text-xs text-amber-300 flex items-center justify-between shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-2 w-full">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-tight text-[11px] sm:text-xs">
          <strong className="text-amber-200 uppercase tracking-wide mr-1 font-semibold">Educational Estimate Notice:</strong>
          Vestly provides mathematical estimates for informational and scenario planning purposes only. This does not constitute tax, financial, legal, or investment advice. Always consult a licensed CPA or tax attorney before exercising options or filing tax elections.
        </span>
      </div>
    </div>
  );
}
