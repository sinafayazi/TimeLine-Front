export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // Using ISO string format for simplicity (e.g., "2024-05-15T10:00:00Z")
  endDate?: string; // Optional end date for events spanning a duration
  mainImage: string; // URL or local path
  images?: string[]; // Optional array of additional image URLs/paths
  category?: string; // Category of the event, used for fallback images
}

export interface Subject {
  id: string;
  name: string;
  categoryId: string;
  events: Event[];
  color?: string; // Optional: Will be assigned dynamically during comparison
  description?: string; // Added description property
  textColor?: string; // Added textColor
  lightColor?: string; // Added lightColor
}

export interface Category {
  id: string;
  name: string;
  color?: string; // Add color property
}
