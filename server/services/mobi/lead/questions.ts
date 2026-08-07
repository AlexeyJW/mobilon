import type { LeadField } from './nextQuestion'

export function getQuestion(field: LeadField): string {

  switch (field) {

    case 'customerName':
      return 'Чудовий вибір 👍 Як до вас можна звертатись?'

    case 'phone':
      return 'Дякую 😊 Підкажіть, будь ласка, номер телефону.'

    case 'city':
      return 'З якого ви міста? (необовʼязково)'

    case 'comment':
      return 'Є якісь побажання до замовлення? (необовʼязково)'

    default:
      return ''

  }

}