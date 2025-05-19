// Color utility functions for timeline comparison

// Predefined color palette for timeline subjects
export const COLOR_PALETTE = [
  { primary: 'bg-red-500', text: 'text-red-800', light: 'bg-red-100', border: 'border-red-600' },
  { primary: 'bg-blue-500', text: 'text-blue-800', light: 'bg-blue-100', border: 'border-blue-600' },
  { primary: 'bg-green-500', text: 'text-green-800', light: 'bg-green-100', border: 'border-green-600' },
  { primary: 'bg-yellow-500', text: 'text-yellow-800', light: 'bg-yellow-100', border: 'border-yellow-600' },
  { primary: 'bg-purple-500', text: 'text-purple-800', light: 'bg-purple-100', border: 'border-purple-600' },
  { primary: 'bg-pink-500', text: 'text-pink-800', light: 'bg-pink-100', border: 'border-pink-600' },
  { primary: 'bg-indigo-500', text: 'text-indigo-800', light: 'bg-indigo-100', border: 'border-indigo-600' },
  { primary: 'bg-teal-500', text: 'text-teal-800', light: 'bg-teal-100', border: 'border-teal-600' },
];

/**
 * Returns two different color schemes for comparison
 * Ensures the two subjects being compared have distinct colors
 */
export const getComparisonColors = () => {
  // Randomly select two different color indexes
  const index1 = Math.floor(Math.random() * COLOR_PALETTE.length);
  let index2 = Math.floor(Math.random() * COLOR_PALETTE.length);
  
  // Make sure the colors are different
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * COLOR_PALETTE.length);
  }
  
  return {
    subject1: COLOR_PALETTE[index1],
    subject2: COLOR_PALETTE[index2]
  };
};

/**
 * Get hex color value from Tailwind class name
 * Used for SVG components that don't work with Tailwind classes
 */
export const getTailwindColor = (colorClass: string): string => {
  // Maps tailwind color classes to hex values
  // This is a simplified example - could be expanded as needed
  const colorMap: Record<string, string> = {
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-teal-500': '#14b8a6',
  };
  
  return colorMap[colorClass] || '#6b7280'; // Default to gray if color not found
};