<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

interface ImportRow {
  rowNumber: number

  raw: Record<
    string,
    string | number | boolean | null
  >

  parsed: {
    name: string

    supplierCategory:
      | string
      | null

    quantity:
      | number
      | null

    buyPrice:
      | number
      | null

    sku:
      | string
      | null

    supplierCode:
      | string
      | null

    barcode:
      | string
      | null
  }

  warnings: string[]

  status:
    | 'ready'
    | 'warning'
}

interface ImportResult {
  fileName: string
  sheetName: string
  headerRow: number

  headers: string[]

 detectedColumns: {
  name: string | null
  category: string | null
  quantity: string | null
  price: string | null
  sku: string | null
  supplierCode: string | null
  barcode: string | null
}

  rows: ImportRow[]

  stats: {
    total: number
    ready: number
    warning: number
  }
}

const loading = ref(false)

const selectedFile =
  ref<File | null>(null)

const result =
  ref<ImportResult | null>(null)

/* ==================================================
   FILE
================================================== */

function handleFileChange(
  event: Event
) {
  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0]

  if (!file) {
    return
  }

  selectedFile.value = file
  result.value = null
}

/* ==================================================
   UPLOAD
================================================== */

async function analyzeFile() {
  if (!selectedFile.value) {
    toast.add({
      title:
        'Виберіть Excel файл',
      color: 'warning'
    })

    return
  }

  try {
    loading.value = true

    const data =
      new FormData()

    data.append(
      'file',
      selectedFile.value
    )

    result.value =
      await $fetch<ImportResult>(
        '/api/admin/import/excel',
        {
          method: 'POST',
          body: data
        }
      )

    toast.add({
      title:
        'Накладну прочитано',
      description:
        `Знайдено ${result.value.stats.total} позицій`,
      color: 'success',
      icon:
        'i-lucide-file-check-2'
    })
  }
  catch (error: any) {
    console.error(error)

    toast.add({
      title:
        'Не вдалося прочитати накладну',

      description:
        error?.data?.message ||
        error?.message ||
        'Помилка Excel',

      color: 'error',
      icon:
        'i-lucide-circle-alert'
    })
  }
  finally {
    loading.value = false
  }
}

/* ==================================================
   RESET
================================================== */

function resetImport() {
  selectedFile.value = null
  result.value = null
}

/* ==================================================
   FORMAT
================================================== */

function formatPrice(
  value: number | null
) {
  if (value === null) {
    return '—'
  }

  return new Intl.NumberFormat(
    'uk-UA',
    {
      maximumFractionDigits: 2
    }
  ).format(value)
}

function formatQuantity(
  value: number | null
) {
  if (value === null) {
    return '—'
  }

  return value
}

//MOBI перевірка на наявність Mobi в назві товару та розпізнавання бренду та категорії
const analyzing =
  ref(false)

const mobiResult =
  ref<any>(null)

async function analyzeWithMobi() {
  if (!result.value) {
    return
  }

  try {
    analyzing.value = true
    mobiResult.value = null

    const rows = result.value.rows.map(row => ({
      rowNumber: row.rowNumber,
      name: row.parsed.name,
      supplierCategory: row.parsed.supplierCategory ?? null,
      quantity: row.parsed.quantity,
      buyPrice: row.parsed.buyPrice,
      sku: row.parsed.sku ?? null,
      supplierCode: row.parsed.supplierCode ?? null,
      barcode: row.parsed.barcode ?? null
    }))

    mobiResult.value = await $fetch(
      '/api/admin/import/analyze',
      {
        method: 'POST',
        body: {
          rows
        }
      }
    )

    toast.add({
      title: 'Аналіз завершено',
      description: 'Mobi розпізнав товари з накладної.',
      color: 'success'
    })
  }
  catch (error: any) {
    console.error(
      'Mobi analyze error:',
      error
    )

    toast.add({
      title: 'Помилка аналізу',
      description:
        error?.data?.message ||
        error?.message ||
        'Не вдалося проаналізувати товари',
      color: 'error'
    })
  }
  finally {
    analyzing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">

    <UiPageHeader
      title="Імпорт товарів"
      description="Завантаження та аналіз накладної постачальника"
    />

    <!-- ==================================================
         UPLOAD
    ================================================== -->

    <UiSectionCard
      title="Накладна"
      description="Excel .xlsx або .xls"
    >

      <div
        class="
          rounded-xl
          border
          border-dashed
          border-default
          p-6
          sm:p-8
        "
      >

        <div
          class="
            flex
            flex-col
            items-center
            text-center
            gap-4
          "
        >

          <div
            class="
              flex
              size-14
              items-center
              justify-center
              rounded-full
              bg-primary/10
            "
          >
            <UIcon
              name="i-lucide-file-spreadsheet"
              class="
                size-7
                text-primary
              "
            />
          </div>

          <div>

            <div
              class="font-semibold"
            >
              Виберіть накладну
            </div>

            <div
              class="
                text-sm
                text-muted
                mt-1
              "
            >
              Поки що дані не
              записуються у базу
            </div>

          </div>

          <label
            class="
              inline-flex
              cursor-pointer
              items-center
              justify-center
              rounded-lg
              bg-primary
              px-4
              py-2
              text-sm
              font-medium
              text-white
            "
          >

            <UIcon
              name="i-lucide-upload"
              class="size-4 mr-2"
            />

            Вибрати Excel

            <input
              type="file"
              accept=".xlsx,.xls"
              class="hidden"
              @change="
                handleFileChange
              "
            >

          </label>

          <div
            v-if="selectedFile"
            class="
              rounded-lg
              bg-elevated
              px-4
              py-3
              text-sm
            "
          >
            <UIcon
              name="i-lucide-file"
              class="mr-1"
            />

            {{
              selectedFile.name
            }}
          </div>

          <div
            v-if="selectedFile"
            class="
              flex
              flex-wrap
              justify-center
              gap-2
            "
          >

            <UButton
              icon="i-lucide-scan-search"
              :loading="loading"
              @click="
                analyzeFile
              "
            >
              Аналізувати
            </UButton>

            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-x"
              @click="
                resetImport
              "
            >
              Очистити
            </UButton>

          </div>

        </div>

      </div>

    </UiSectionCard>

    <!-- ==================================================
         RESULT
    ================================================== -->

    <template v-if="result">

      <!-- FILE INFO -->

      <UiSectionCard
        title="Результат аналізу"
      >

        <div
          class="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-4
          "
        >

          <div
            class="
              rounded-xl
              bg-elevated
              p-4
            "
          >
            <div
              class="
                text-sm
                text-muted
              "
            >
              Файл
            </div>

            <div
              class="
                font-medium
                mt-1
                break-all
              "
            >
              {{ result.fileName }}
            </div>
          </div>

          <div
            class="
              rounded-xl
              bg-elevated
              p-4
            "
          >
            <div
              class="
                text-sm
                text-muted
              "
            >
              Лист
            </div>

            <div
              class="
                font-medium
                mt-1
              "
            >
              {{ result.sheetName }}
            </div>
          </div>

          <div
            class="
              rounded-xl
              bg-elevated
              p-4
            "
          >
            <div
              class="
                text-sm
                text-muted
              "
            >
              Рядок заголовків
            </div>

            <div
              class="
                text-xl
                font-bold
                mt-1
              "
            >
              {{ result.headerRow }}
            </div>
          </div>

          <div
            class="
              rounded-xl
              bg-elevated
              p-4
            "
          >
            <div
              class="
                text-sm
                text-muted
              "
            >
              Позицій
            </div>

            <div
              class="
                text-xl
                font-bold
                mt-1
              "
            >
              {{ result.stats.total }}
            </div>
          </div>

        </div>

      </UiSectionCard>

      <!-- DETECTED COLUMNS -->

      <UiSectionCard
        title="Розпізнані колонки"
        description="Перевір, чи правильно система зрозуміла накладну"
      >

        <div
          class="
            flex
            flex-wrap
            gap-2
          "
        >

          <UBadge
            color="primary"
            variant="soft"
          >
            Товар:
            {{
              result
                .detectedColumns
                .name || '—'
            }}
          </UBadge>

          <UBadge
            :color="
              result
                .detectedColumns
                .quantity
                ? 'success'
                : 'warning'
            "
            variant="soft"
          >
            Кількість:
            {{
              result
                .detectedColumns
                .quantity || '—'
            }}
          </UBadge>

          <UBadge
            :color="
              result
                .detectedColumns
                .price
                ? 'success'
                : 'warning'
            "
            variant="soft"
          >
            Ціна:
            {{
              result
                .detectedColumns
                .price || '—'
            }}
          </UBadge>

          <UBadge
            color="neutral"
            variant="soft"
          >
            Артикул:
            {{
              result
                .detectedColumns
                .sku || '—'
            }}
          </UBadge>

          <UBadge
            color="neutral"
            variant="soft"
          >
            Штрихкод:
            {{
              result
                .detectedColumns
                .barcode || '—'
            }}
          </UBadge>

        </div>

      </UiSectionCard>

      <!-- STATS -->

      <div
        class="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-4
        "
      >

        <div
          class="
            rounded-xl
            border
            border-default
            p-4
          "
        >
          <div
            class="
              text-sm
              text-muted
            "
          >
            Всього
          </div>

          <div
            class="
              text-2xl
              font-bold
              mt-1
            "
          >
            {{ result.stats.total }}
          </div>
        </div>

        <div
          class="
            rounded-xl
            border
            border-success/30
            p-4
          "
        >
          <div
            class="
              text-sm
              text-muted
            "
          >
            Готові
          </div>

          <div
            class="
              text-2xl
              font-bold
              text-success
              mt-1
            "
          >
            {{ result.stats.ready }}
          </div>
        </div>

        <div
          class="
            rounded-xl
            border
            border-warning/30
            p-4
          "
        >
          <div
            class="
              text-sm
              text-muted
            "
          >
            Перевірити
          </div>

          <div
            class="
              text-2xl
              font-bold
              text-warning
              mt-1
            "
          >
            {{ result.stats.warning }}
          </div>
        </div>

      </div>
      <!--=================================================
      
                  ANALYZE WITH MOBI 
       
      ====================================================-->

      <UButton
        v-if="result"
        icon="i-lucide-sparkles"
        size="lg"
        :loading="analyzing"
        @click="analyzeWithMobi"
      >
        Розпізнати товари Mobi
      </UButton>
      <!--=================================================
      
                  MOBI RESULT 
    ===================================================-->
    <div
  v-if="mobiResult"
  class="space-y-3"
>
  <div
  v-for="row in mobiResult.rows"
  :key="row.rowNumber"
  class="
    rounded-xl
    border
    border-default
    p-4
  "
>
  <div
    class="
      flex
      flex-col
      gap-3
      sm:flex-row
      sm:items-start
      sm:justify-between
    "
  >
    <div class="min-w-0">
      <div
        class="
          font-semibold
          break-words
        "
      >
        {{ row.source.name }}
      </div>

      <div
        class="
          text-sm
          text-muted
          mt-1
        "
      >
        Рядок {{ row.rowNumber }}
      </div>
    </div>

    <UBadge
      :color="
        row.status === 'ready'
          ? 'success'
          : row.status === 'review'
            ? 'warning'
            : 'error'
      "
      variant="soft"
    >
      {{ row.confidencePercent }}%
    </UBadge>
  </div>

  <div
    class="
      grid
      grid-cols-1
      sm:grid-cols-2
      gap-3
      mt-4
    "
  >
    <div
      class="
        rounded-lg
        bg-elevated
        p-3
      "
    >
      <div
        class="
          text-xs
          text-muted
        "
      >
        Бренд
      </div>

      <div class="font-medium">
        {{ row.brand?.name || 'Не визначено' }}
      </div>
    </div>

    <div
      class="
        rounded-lg
        bg-elevated
        p-3
      "
    >
      <div
        class="
          text-xs
          text-muted
        "
      >
        Категорія
      </div>

      <div class="font-medium">
        {{ row.category?.name || 'Не визначено' }}
      </div>
    </div>
  </div>

  <!-- Розпізнані характеристики -->
  <div
    v-if="row.specifications?.length"
    class="mt-4"
  >
    <div
      class="
        text-xs
        text-muted
        mb-2
      "
    >
      Розпізнані характеристики
    </div>

    <div
      class="
        flex
        flex-wrap
        gap-2
      "
    >
      <UBadge
        v-for="spec in row.specifications"
        :key="spec.specificationId"
        color="neutral"
        variant="soft"
      >
        {{ spec.name }}:
        {{ spec.displayValue }}
      </UBadge>
    </div>
  </div>

  <!-- Відсутні обов'язкові характеристики -->
  <div
    v-if="row.missingSpecificationsCount > 0"
    class="
      rounded-lg
      bg-info/10
      p-3
      mt-4
    "
  >
    <div
      class="
        flex
        items-center
        gap-2
        text-sm
        font-medium
      "
    >
      <UIcon
        name="i-lucide-info"
        class="size-4"
      />

      <span>
        Потрібно доповнити характеристики:
        {{ row.missingSpecificationsCount }}
      </span>
    </div>

    <div
      v-if="row.missingSpecifications?.length"
      class="
        text-xs
        text-muted
        mt-2
        leading-relaxed
      "
    >
      {{
        row.missingSpecifications
          .map(spec => spec.name)
          .join(', ')
      }}
    </div>
  </div>

  <!-- Схожий товар -->
  <div
    v-if="row.matchedProduct"
    class="
      text-xs
      text-muted
      mt-4
    "
  >
    Схожий товар у базі:
    <strong>
      {{ row.matchedProduct.name }}
    </strong>
  </div>

  <!-- Справжні проблеми імпорту -->
  <div
    v-if="row.warnings?.length"
    class="
      rounded-lg
      bg-warning/10
      p-3
      mt-4
    "
  >
    <div
      class="
        font-medium
        text-sm
        mb-1
      "
    >
      Потрібна перевірка
    </div>

    <div
      v-for="warning in row.warnings"
      :key="warning"
      class="
        text-sm
        text-warning
      "
    >
      • {{ warning }}
    </div>
  </div>
</div>
</div>
      <!-- ==================================================
           PRODUCTS
      ================================================== -->

      <UiSectionCard
        title="Товари з накладної"
        description="Попередній перегляд перед розпізнаванням Mobi"
      >

        <!-- DESKTOP -->

        <div
          class="
            hidden
            md:block
            overflow-x-auto
          "
        >

          <table
            class="
              w-full
              text-sm
            "
          >

            <thead>

              <tr
                class="
                  border-b
                  border-default
                  text-left
                "
              >

                <th class="p-3">
                  #
                </th>

                <th class="p-3">
                  Товар
                </th>

                <th class="p-3">
                  Кількість
                </th>

                <th class="p-3">
                  Закупка
                </th>

                <th class="p-3">
                  Статус
                </th>

              </tr>

            </thead>

            <tbody>

              <tr
                v-for="
                  row in result.rows
                "
                :key="
                  row.rowNumber
                "
                class="
                  border-b
                  border-default/50
                "
              >

                <td
                  class="
                    p-3
                    text-muted
                  "
                >
                  {{ row.rowNumber }}
                </td>

                <td
                  class="
                    p-3
                    font-medium
                  "
                >
                  {{ row.parsed.name }}
                </td>

                <td class="p-3">
                  {{
                    formatQuantity(
                      row.parsed.quantity
                    )
                  }}
                </td>

                <td class="p-3">
                  {{
                    formatPrice(
                      row.parsed.buyPrice
                    )
                  }}
                  грн
                </td>

                <td class="p-3">

                  <UBadge
                    :color="
                      row.status ===
                        'ready'
                        ? 'success'
                        : 'warning'
                    "
                    variant="soft"
                  >
                    {{
                      row.status ===
                        'ready'
                        ? 'Готово'
                        : 'Перевірити'
                    }}
                  </UBadge>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

        <!-- MOBILE -->

        <div
          class="
            md:hidden
            space-y-3
          "
        >

          <div
            v-for="
              row in result.rows
            "
            :key="
              row.rowNumber
            "
            class="
              rounded-xl
              border
              border-default
              p-4
            "
          >

            <div
              class="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div class="min-w-0">

                <div
                  class="
                    font-semibold
                    break-words
                  "
                >
                  {{ row.parsed.name }}
                </div>

                <div
                  class="
                    text-xs
                    text-muted
                    mt-1
                  "
                >
                  Рядок
                  {{ row.rowNumber }}
                </div>

              </div>

              <UBadge
                :color="
                  row.status ===
                    'ready'
                    ? 'success'
                    : 'warning'
                "
                variant="soft"
              >
                {{
                  row.status ===
                    'ready'
                    ? 'Готово'
                    : 'Перевірити'
                }}
              </UBadge>

            </div>

            <div
              class="
                grid
                grid-cols-2
                gap-3
                mt-4
              "
            >

              <div>

                <div
                  class="
                    text-xs
                    text-muted
                  "
                >
                  Кількість
                </div>

                <div
                  class="
                    font-medium
                  "
                >
                  {{
                    formatQuantity(
                      row.parsed.quantity
                    )
                  }}
                </div>

              </div>

              <div>

                <div
                  class="
                    text-xs
                    text-muted
                  "
                >
                  Закупка
                </div>

                <div
                  class="
                    font-medium
                  "
                >
                  {{
                    formatPrice(
                      row.parsed.buyPrice
                    )
                  }}
                  грн
                </div>

              </div>

            </div>

            <div
              v-if="
                row.warnings.length
              "
              class="
                mt-3
                rounded-lg
                bg-warning/10
                p-3
              "
            >

              <div
                v-for="
                  warning
                  in row.warnings
                "
                :key="warning"
                class="
                  text-xs
                  text-warning
                "
              >
                • {{ warning }}
              </div>

            </div>

          </div>

        </div>

      </UiSectionCard>

    </template>

  </div>
</template>