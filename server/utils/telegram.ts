export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is missing')
  }

  if (!chatId) {
    throw new Error('TELEGRAM_CHAT_ID is missing')
  }

  try {
    const response = await $fetch<{
      ok: boolean
      result?: {
        message_id: number
      }
      description?: string
      error_code?: number
    }>(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      }
    })

    if (!response.ok) {
      throw new Error(
        `Telegram API error: ${response.error_code} - ${response.description}`
      )
    }

    console.log(
      `Telegram message sent successfully. Message ID: ${response.result?.message_id}`
    )

    return response
  } catch (error) {
    console.error('Telegram send error:', error)
    throw error
  }
}