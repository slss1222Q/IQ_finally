// Telegram Mini Apps HapticFeedback API with Navigator Vibrate Fallback

class HapticManager {
  private get tgHaptic(): any {
    try {
      if (typeof window !== 'undefined') {
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.HapticFeedback) {
          return tg.HapticFeedback;
        }
      }
    } catch {}
    return null;
  }

  /**
   * Notification feedback on success (e.g. stage complete, correct answer, puzzle solved)
   */
  public success() {
    try {
      const haptic = this.tgHaptic;
      if (haptic && typeof haptic.notificationOccurred === 'function') {
        haptic.notificationOccurred('success');
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([35, 50, 35]);
      }
    } catch {}
  }

  /**
   * Notification feedback on error / failure (e.g. trap hit, wrong pick, game over)
   */
  public error() {
    try {
      const haptic = this.tgHaptic;
      if (haptic && typeof haptic.notificationOccurred === 'function') {
        haptic.notificationOccurred('error');
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch {}
  }

  /**
   * Warning feedback (e.g. low timer, close call)
   */
  public warning() {
    try {
      const haptic = this.tgHaptic;
      if (haptic && typeof haptic.notificationOccurred === 'function') {
        haptic.notificationOccurred('warning');
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    } catch {}
  }

  /**
   * Impact feedback for physical contact (e.g. tumbler click, jump, key tap)
   */
  public impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      const haptic = this.tgHaptic;
      if (haptic && typeof haptic.impactOccurred === 'function') {
        haptic.impactOccurred(style);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const duration = style === 'heavy' || style === 'rigid' ? 40 : style === 'light' || style === 'soft' ? 15 : 25;
        navigator.vibrate(duration);
      }
    } catch {}
  }

  /**
   * Selection feedback for UI items (e.g. button click, card select)
   */
  public selection() {
    try {
      const haptic = this.tgHaptic;
      if (haptic && typeof haptic.selectionChanged === 'function') {
        haptic.selectionChanged();
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
      }
    } catch {}
  }
}

export const hapticManager = new HapticManager();
