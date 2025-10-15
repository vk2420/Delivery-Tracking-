/**
 * Common delivery failure reasons in English and Arabic
 * Use these for consistency in failure notifications
 */

const FAILURE_REASONS = [
  {
    english: "Customer not available",
    arabic: "العميل غير متوفر"
  },
  {
    english: "Incorrect or incomplete address",
    arabic: "العنوان غير صحيح أو غير مكتمل"
  },
  {
    english: "Gate locked / Building closed",
    arabic: "البوابة مقفلة / المبنى مغلق"
  },
  {
    english: "Customer requested postponement",
    arabic: "العميل طلب التأجيل"
  },
  {
    english: "Traffic delay",
    arabic: "تأخير بسبب الزحام"
  },
  {
    english: "Weather conditions",
    arabic: "الظروف الجوية"
  },
  {
    english: "Item damaged - needs replacement",
    arabic: "المنتج تالف - يحتاج استبدال"
  },
  {
    english: "Wrong item in delivery",
    arabic: "منتج خاطئ في الشحنة"
  },
  {
    english: "Customer changed delivery date",
    arabic: "العميل غير تاريخ التوصيل"
  },
  {
    english: "Access issue (elevator broken, etc)",
    arabic: "مشكلة في الوصول (المصعد معطل، إلخ)"
  },
  {
    english: "Customer phone not reachable",
    arabic: "هاتف العميل غير متاح"
  },
  {
    english: "Delivery requires special equipment",
    arabic: "التوصيل يتطلب معدات خاصة"
  },
  {
    english: "Customer refused delivery",
    arabic: "العميل رفض الاستلام"
  },
  {
    english: "Payment issue",
    arabic: "مشكلة في الدفع"
  },
  {
    english: "Vehicle breakdown",
    arabic: "عطل في السيارة"
  }
];

/**
 * Get Arabic translation for English reason
 */
const getArabicReason = (englishReason) => {
  const match = FAILURE_REASONS.find(
    r => r.english.toLowerCase() === englishReason.toLowerCase()
  );
  return match ? match.arabic : englishReason;
};

/**
 * Get English translation for Arabic reason
 */
const getEnglishReason = (arabicReason) => {
  const match = FAILURE_REASONS.find(r => r.arabic === arabicReason);
  return match ? match.english : arabicReason;
};

/**
 * Get all reasons for dropdown/selection
 */
const getAllReasons = () => FAILURE_REASONS;

module.exports = {
  FAILURE_REASONS,
  getArabicReason,
  getEnglishReason,
  getAllReasons
};




