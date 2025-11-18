import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function calculateCheckInDuration(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPassengerFullName(passenger: { firstName: string; lastName: string; title?: string }): string {
  return passenger.title
    ? `${passenger.title} ${passenger.firstName} ${passenger.lastName}`
    : `${passenger.firstName} ${passenger.lastName}`;
}

export function parseSeatNumber(seatNumber: string): { row: number; column: string } {
  const match = seatNumber.match(/^(\d+)([A-K])$/);
  if (!match) {
    throw new Error('Invalid seat number format');
  }
  return {
    row: parseInt(match[1], 10),
    column: match[2],
  };
}

export function isValidPNR(pnr: string): boolean {
  return /^[A-Z0-9]{6}$/.test(pnr);
}

export function playNotificationSound() {
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }
}
