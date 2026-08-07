import type { Lead, Product } from '@prisma/client'

export function formatLead(
  lead: Lead,
  product: Product
) {
  return `
🟢 <b>Нова заявка Mobilon</b>

━━━━━━━━━━━━━━

👤 <b>Клієнт:</b>
${lead.customerName}

📞 <b>Телефон:</b>
${lead.phone}

🏙 <b>Місто:</b>
${lead.city || '—'}

📦 <b>Товар:</b>
${product.name}

💬 <b>Коментар:</b>
${lead.comment || '—'}

━━━━━━━━━━━━━━
🕒 ${new Date().toLocaleString('uk-UA')}
`
}