/**
 * Smart Relative & Persian Date Formatter
 * Provides user-friendly relative timestamps (e.g. 'همین الان', '10 دقیقه قبل', 'دیروز، ساعت 14:30')
 */
export const formatSmartDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 3600 * 24));

    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    const timeFormatter = new Intl.DateTimeFormat('fa-IR', { hour: 'numeric', minute: 'numeric' });

    if (diffDays === 0) {
      if (diffMinutes < 1) return 'همین الان';
      if (diffMinutes < 60) return `${diffMinutes} دقیقه قبل`;
      return `${diffHours} ساعت قبل`;
    } else if (diffDays === 1) {
      return `دیروز، ساعت ${timeFormatter.format(date)}`;
    } else {
      // تولید تاریخ استاندارد جلالی
      let fullDate = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);

      // آرایه‌های جایگزینی ماه‌های ایرانی با ماه‌های دری
      const iranianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
      const dariMonths = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];

      // اعمال جایگزینی در متن تاریخ
      for (let i = 0; i < 12; i++) {
        fullDate = fullDate.replace(iranianMonths[i], dariMonths[i]);
      }

      return fullDate;
    }
  } catch {
    return String(dateString);
  }
};

