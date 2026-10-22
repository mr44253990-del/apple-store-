import type { AppItem, ReviewItem } from '../types.ts';

// Clean initial state with all demo apps removed as requested
export const INITIAL_APPS: AppItem[] = [];

export const INITIAL_REVIEWS: Record<string, ReviewItem[]> = {};
