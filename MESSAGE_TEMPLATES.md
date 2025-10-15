# WhatsApp Message Templates - Delivery Status Updates

## 1. Failed Delivery Notification

### Scenario: Driver attempted delivery but customer not available / address issue / other reason

```
🚫 Delivery Attempt Failed | محاولة التوصيل فشلت

Dear Customer,
We attempted to deliver your furniture order (Invoice #{invoiceNo}) today, but were unable to complete the delivery.

📋 Reason: {reason}
📅 Original Delivery Date: {originalDate}
📞 Please contact us: {customerCarePhone}

We will reschedule your delivery soon.

عزيزي العميل،
حاولنا توصيل طلبك من الأثاث (فاتورة رقم {invoiceNo}) اليوم، ولكن لم نتمكن من إتمام التوصيل.

📋 السبب: {reasonArabic}
📅 تاريخ التوصيل الأصلي: {originalDate}
📞 يرجى الاتصال بنا: {customerCarePhone}

سنقوم بإعادة جدولة التوصيل قريباً.

Thank you for your patience | شكراً لتفهمك
```

**Common Reasons:**
- Customer not available
- Incorrect address
- Access issue (gate locked, building closed)
- Customer requested postponement
- Weather/traffic delay

---

## 2. Postponed Delivery Notification

### Scenario: Delivery rescheduled to a new date

```
📅 Delivery Rescheduled | إعادة جدولة التوصيل

Dear Customer,
Your furniture delivery (Invoice #{invoiceNo}) has been rescheduled.

📅 New Delivery Date: {newDate}
⏰ Time Window: {timeWindow}
👤 Driver: {driverName}
📱 Driver Contact: {driverPhone}

📋 Reason for Reschedule: {reason}

Please ensure someone is available at the delivery address.

عزيزي العميل،
تم إعادة جدولة توصيل الأثاث (فاتورة رقم {invoiceNo}).

📅 تاريخ التوصيل الجديد: {newDate}
⏰ الوقت المتوقع: {timeWindow}
👤 السائق: {driverName}
📱 هاتف السائق: {driverPhone}

📋 سبب إعادة الجدولة: {reason}

يرجى التأكد من وجود شخص في عنوان التوصيل.

Thank you! | شكراً لك
```

---

## 3. Replacement/Exchange Scheduled

### Scenario: Customer item needs replacement, new delivery scheduled

```
🔄 Replacement Scheduled | تم جدولة الاستبدال

Dear Customer,
We have scheduled a replacement for your furniture item (Invoice #{invoiceNo}).

🆕 Replacement Details:
📅 Pickup Date: {pickupDate}
📅 Delivery Date: {deliveryDate}
⏰ Time Window: {timeWindow}
👤 Driver: {driverName}
📱 Driver Contact: {driverPhone}

📋 Item: {itemDescription}
💡 Note: We will collect the old item and deliver the replacement.

عزيزي العميل،
تم جدولة استبدال قطعة الأثاث (فاتورة رقم {invoiceNo}).

🆕 تفاصيل الاستبدال:
📅 تاريخ الاستلام: {pickupDate}
📅 تاريخ التوصيل: {deliveryDate}
⏰ الوقت المتوقع: {timeWindow}
👤 السائق: {driverName}
📱 هاتف السائق: {driverPhone}

📋 المنتج: {itemDescription}
💡 ملاحظة: سنقوم باستلام المنتج القديم وتوصيل البديل.

Thank you for your patience | شكراً لصبرك
```

---

## 4. Delivery Successfully Completed

### Scenario: Delivery completed, confirmation message

```
✅ Delivery Completed | تم التوصيل بنجاح

Dear Customer,
Your furniture order (Invoice #{invoiceNo}) has been successfully delivered!

📅 Delivery Date: {deliveryDate}
⏰ Delivery Time: {deliveryTime}
👤 Delivered By: {driverName}

We hope you enjoy your new furniture!

💡 Need help? Contact our customer care: {customerCarePhone}

عزيزي العميل،
تم توصيل طلبك من الأثاث (فاتورة رقم {invoiceNo}) بنجاح!

📅 تاريخ التوصيل: {deliveryDate}
⏰ وقت التوصيل: {deliveryTime}
👤 تم التوصيل بواسطة: {driverName}

نتمنى أن تستمتع بأثاثك الجديد!

💡 تحتاج مساعدة؟ اتصل بخدمة العملاء: {customerCarePhone}

Thank you! | شكراً لك
```

---

## 5. Out for Delivery (Current - Enhanced)

```
🚚 Out for Delivery | في طريقه للتوصيل

Dear Customer,
Your furniture order (Invoice #{invoiceNo}) is out for delivery TODAY!

📅 Expected Delivery: {timeWindow}
👤 Driver: {driverName}
📱 Driver Contact: {driverPhone}

💡 Please ensure someone is available at the delivery address.

عزيزي العميل،
طلبك من الأثاث (فاتورة رقم {invoiceNo}) في طريقه للتوصيل اليوم!

📅 التوصيل المتوقع: {timeWindow}
👤 السائق: {driverName}
📱 هاتف السائق: {driverPhone}

💡 يرجى التأكد من وجود شخص في عنوان التوصيل.

Thank you! | شكراً لك
```

---

## 6. Delivery on Hold (Customer Request)

### Scenario: Customer asked to hold delivery temporarily

```
⏸️ Delivery On Hold | التوصيل معلق

Dear Customer,
Your furniture delivery (Invoice #{invoiceNo}) is currently on hold as per your request.

📋 Reason: {reason}
📅 Original Date: {originalDate}

To resume delivery, please contact us:
📞 Customer Care: {customerCarePhone}

عزيزي العميل،
توصيل الأثاث (فاتورة رقم {invoiceNo}) معلق حالياً بناءً على طلبك.

📋 السبب: {reason}
📅 التاريخ الأصلي: {originalDate}

لاستئناف التوصيل، يرجى الاتصال بنا:
📞 خدمة العملاء: {customerCarePhone}

Thank you! | شكراً لك
```

---

## 7. Urgent: Customer Action Required

### Scenario: Need customer confirmation/action before delivery

```
⚠️ Action Required | مطلوب إجراء

Dear Customer,
We need your confirmation for the furniture delivery (Invoice #{invoiceNo}).

❗ Issue: {issue}

Please reply or call us:
📞 Customer Care: {customerCarePhone}
⏰ Respond within 24 hours to avoid delays.

عزيزي العميل،
نحتاج إلى تأكيدك لتوصيل الأثاث (فاتورة رقم {invoiceNo}).

❗ المشكلة: {issue}

يرجى الرد أو الاتصال بنا:
📞 خدمة العملاء: {customerCarePhone}
⏰ الرد خلال 24 ساعة لتجنب التأخير.

Thank you! | شكراً لك
```

---

## Message Triggers & When to Send

| Status | Trigger | Message Template |
|--------|---------|------------------|
| Out for Delivery | PDF upload completed | Template #5 (Current) |
| Failed Delivery | Driver marks failed | Template #1 |
| Postponed | Admin/Driver reschedules | Template #2 |
| Replacement | Admin creates replacement order | Template #3 |
| Delivered | Driver marks delivered | Template #4 |
| On Hold | Customer/Admin puts on hold | Template #6 |
| Action Needed | System/Admin flags issue | Template #7 |

---

## Common Failure Reasons (English/Arabic)

| English | Arabic |
|---------|--------|
| Customer not available | العميل غير متوفر |
| Incorrect/Incomplete address | العنوان غير صحيح أو غير مكتمل |
| Gate locked / Building closed | البوابة مقفلة / المبنى مغلق |
| Customer requested postponement | العميل طلب التأجيل |
| Traffic/Weather delay | تأخير بسبب الطقس/الزحام |
| Item damaged - needs replacement | المنتج تالف - يحتاج استبدال |
| Wrong item delivered | تم توصيل منتج خاطئ |
| Customer changed delivery date | العميل غير تاريخ التوصيل |

---

## API Response Format (for mobile app integration)

```json
{
  "messageType": "failed_delivery",
  "invoiceNo": "40124503933920250922",
  "customerPhone": "0555623834",
  "reason": "Customer not available",
  "reasonArabic": "العميل غير متوفر",
  "originalDate": "2025-10-01",
  "newDate": null,
  "customerCarePhone": "920012345",
  "messageSent": true,
  "timestamp": "2025-10-01T15:30:00Z"
}
```




