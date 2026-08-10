const aliases: Record<string, string> = {
  // Багатослівні категорії — ставимо першими
  'блок живлення': 'Зарядні пристрої',
  'блок зарядки': 'Зарядні пристрої',
  'шнур зарядки': 'Кабелі',

  // Категорії
  телефон: 'Смартфон',
  телефони: 'Смартфон',
  смартфон: 'Смартфон',
  смартфони: 'Смартфон',
  мобілка: 'Смартфон',
  мобільний: 'Смартфон',

  навушники: 'Навушники',
  блютуз: 'Навушники',
  bluetooth: 'Навушники',
  tws: 'Навушники',

  зарядка: 'Зарядні пристрої',
  зарядку: 'Зарядні пристрої',
  зарядне: 'Зарядні пристрої',
  зарядний: 'Зарядні пристрої',
  адаптер: 'Зарядні пристрої',

  кабель: 'Кабелі',
  кабелі: 'Кабелі',
  шнур: 'Кабелі',
  шнурок: 'Кабелі',
  шнурки: 'Кабелі',

  павербанк: 'Повербанк',
  powerbank: 'Повербанк',

  чохол: 'Чохол',
  кейс: 'Чохол',

  скло: 'Захисне скло',

  // Бренди
  самсунг: 'Samsung',
  samsung: 'Samsung',
  самсунги: 'Samsung',

  айфон: 'Apple',
  iphone: 'Apple',
  епл: 'Apple',
  apple: 'Apple',

  сяомі: 'Xiaomi',
  ксяомі: 'Xiaomi',
  xiaomi: 'Xiaomi',

  моторола: 'Motorola',
  motorola: 'Motorola',

  редмі: 'Redmi',
  redmi: 'Redmi',

  поко: 'POCO',
  poco: 'POCO',

  реалмі: 'Realme',
  realme: 'Realme'
}


export function normalizeQuery(query: string) {
  let q = query.trim().toLowerCase()

  if (!q) {
    return query
  }

  // Спочатку перевіряємо повну фразу
  if (aliases[q]) {
    return aliases[q]
  }

  // Потім замінюємо відомі багатослівні фрази
  const phrases = Object.keys(aliases)
    .filter(key => key.includes(' '))
    .sort((a, b) => b.length - a.length)

  for (const phrase of phrases) {
    if (q.includes(phrase)) {
      q = q.replace(phrase, aliases[phrase])
    }
  }

  // Потім замінюємо окремі слова
  const words = q.split(/\s+/)

  const normalizedWords = words.map(word => {
    return aliases[word] ?? word
  })

  return normalizedWords.join(' ')
}