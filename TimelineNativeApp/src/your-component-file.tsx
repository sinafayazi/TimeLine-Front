import React, { useMemo } from 'react';
import { Event as ImportedEvent } from './types';
import { getCategoryFallback } from './utils/imageFallbacks'; // Corrected import path assuming it's in src/utils

declare const event: ImportedEvent | undefined;

const fallbackImage = useMemo(() => {
  if (!event) return getCategoryFallback('default');
  return getCategoryFallback(event.category || 'default');
}, [event?.category]);