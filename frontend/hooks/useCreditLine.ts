'use client';
import { useContext } from 'react';
import { createContext } from 'react';

// Re-export the context hook directly — all derived values are computed in CreditLineProvider
export { useCreditLineCtx as useCreditLine } from '@/lib/creditLineContext';
