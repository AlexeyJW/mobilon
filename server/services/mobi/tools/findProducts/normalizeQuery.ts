const aliases: Record<string, string> = {
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

  зарядка: 'Зарядний пристрій',
  зарядний: 'Зарядний пристрій',
  адаптер: 'Зарядний пристрій',

  кабель: 'Кабель',
  шнур: 'Кабель',

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
  const q = query.trim().toLowerCase()

  return aliases[q] ?? query
}   