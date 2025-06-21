
export class TimeUtils {
  getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  getDayOfWeek(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }
}

export const timeUtils = new TimeUtils();
