// Simple hash function for consistent color generation
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate a color based on user ID
export function generateUserColor(userId: string): string {
  const hash = hashString(userId);
  return `hsl(${hash % 360}, 70%, 60%)`;
}

// Get or create guest ID
export function getGuestId(): string {
  const storageKey = 'guest_user_id';
  let guestId = localStorage.getItem(storageKey);
  
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(storageKey, guestId);
  }
  
  return guestId;
}

// Debounce function for cursor updates
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 