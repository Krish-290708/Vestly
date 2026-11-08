'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface Grant {
  id: string;
  companyName: string;
  grantType: 'ISO' | 'NSO' | 'RSU' | 'ESPP' | string;
  sharesTotal: number;
  strikePrice: number;
  currentFmv: number;
  grantDate: string;
  vestingStartDate: string;
  cliffMonths: number;
  vestingMonths: number;
  expirationDate: string | null;
  notes?: string | null;
  documentPath?: string | null;
  originalFileName?: string | null;
  [key: string]: any;
}

export interface TaxDefaults {
  filingStatus: string;
  stateCode: string;
  annualIncome: number;
}

interface GrantContextType {
  grants: Grant[];
  selectedGrantId: string | null;
  selectedGrant: Grant | null;
  loading: boolean;
  taxDefaults: TaxDefaults | null;
  setSelectedGrantId: (id: string | null) => void;
  refreshGrants: () => Promise<void>;
  buildGrantUrl: (basePath: string, grantId?: string | null) => string;
}

const GrantContext = createContext<GrantContextType | undefined>(undefined);

export function GrantProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [grants, setGrants] = useState<Grant[]>([]);
  const [selectedGrantId, setSelectedGrantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [taxDefaults, setTaxDefaults] = useState<TaxDefaults | null>(null);

  const fetchGrants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/grants');
      if (res.ok) {
        const data = await res.json();
        const grantList: Grant[] = data.grants || [];
        setGrants(grantList);
      }
    } catch (err) {
      console.error('Failed to load grants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaxDefaults = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data?.taxDefaults) {
          setTaxDefaults(data.taxDefaults);
        }
      }
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    fetchGrants();
    fetchTaxDefaults();
  }, [fetchGrants, fetchTaxDefaults]);

  // Sync selected grant with ?grant= parameter in URL
  const queryGrantId = searchParams.get('grant');
  useEffect(() => {
    if (queryGrantId) {
      setSelectedGrantIdState(queryGrantId);
    } else if (grants.length > 0 && !selectedGrantId) {
      setSelectedGrantIdState(grants[0].id);
    }
  }, [queryGrantId, grants, selectedGrantId]);

  const setSelectedGrantId = useCallback(
    (id: string | null) => {
      setSelectedGrantIdState(id);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (id) {
          params.set('grant', id);
        } else {
          params.delete('grant');
        }
        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState(null, '', newUrl);
      }
    },
    [pathname]
  );

  const selectedGrant = useMemo(() => {
    if (!grants.length) return null;
    if (selectedGrantId) {
      const found = grants.find((g) => g.id === selectedGrantId);
      if (found) return found;
    }
    return grants[0] || null;
  }, [grants, selectedGrantId]);

  const buildGrantUrl = useCallback(
    (basePath: string, grantId?: string | null) => {
      const targetId = grantId !== undefined ? grantId : selectedGrantId;
      if (!targetId) return basePath;
      const [pathAndQuery, hash] = basePath.split('#', 2);
      const separator = pathAndQuery.includes('?') ? '&' : '?';
      return `${pathAndQuery}${separator}grant=${encodeURIComponent(targetId)}${hash ? `#${hash}` : ''}`;
    },
    [selectedGrantId]
  );

  const value = useMemo(
    () => ({
      grants,
      selectedGrantId,
      selectedGrant,
      loading,
      taxDefaults,
      setSelectedGrantId,
      refreshGrants: fetchGrants,
      buildGrantUrl,
    }),
    [
      grants,
      selectedGrantId,
      selectedGrant,
      loading,
      taxDefaults,
      setSelectedGrantId,
      fetchGrants,
      buildGrantUrl,
    ]
  );

  return <GrantContext.Provider value={value}>{children}</GrantContext.Provider>;
}

const defaultContextValue: GrantContextType = {
  grants: [],
  selectedGrantId: null,
  selectedGrant: null,
  loading: false,
  taxDefaults: null,
  setSelectedGrantId: () => {},
  refreshGrants: async () => {},
  buildGrantUrl: (basePath: string) => basePath,
};

export function useGrant(): GrantContextType {
  const context = useContext(GrantContext);
  return context || defaultContextValue;
}
