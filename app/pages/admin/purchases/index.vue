<!-- pages/admin/purchases/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-default">
          Закупівлі
        </h1>
        <p class="text-muted text-sm">
          Управління товарами на складі
        </p>
      </div>
      
      <div class="flex gap-2">
        <UButton
          color="primary"
          variant="outline"
          @click="exportToExcel"
        >
          <Icon name="i-lucide-file-spreadsheet" class="w-4 h-4" />
          <span class="hidden sm:inline">Експорт Excel</span>
        </UButton>
      </div>
    </div>

    <!-- Інша частина сторінки без змін... -->
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'

// ... ваш код ...

// Експорт в Excel з підтримкою кирилиці
const exportToExcel = () => {
  if (!filteredPurchases.value.length) {
    alert('Немає даних для експорту')
    return
  }
  
  try {
    // Підготовка даних
    const data = filteredPurchases.value.map(item => ({
      'Назва': item.name,
      'Кількість': item.quantity,
      'Постачальник': item.supplier || '',
      'Примітка': item.note || '',
      'Дата': formatDate(item.createdAt)
    }))
    
    // Створення робочої книги
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Налаштування ширини колонок
    ws['!cols'] = [
      { wch: 30 }, // Назва
      { wch: 15 }, // Кількість
      { wch: 25 }, // Постачальник
      { wch: 30 }, // Примітка
      { wch: 25 }  // Дата
    ]
    
    // Додаємо стилі для заголовків (опціонально)
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'
      if (!ws[address]) continue
      ws[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "22C55E" } },
        alignment: { horizontal: "center" }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Закупівлі')
    
    // Збереження файлу
    const fileName = `закупівлі_${new Date().toLocaleDateString('uk-UA')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
  } catch (error) {
    console.error('Помилка експорту:', error)
    alert('Сталася помилка при експорті даних')
  }
}
</script>