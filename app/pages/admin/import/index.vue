<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

interface ImportRow {
  rowNumber: number
  raw: Record<string, string | number | boolean | null>
  parsed: {
    name: string
    supplierCategory: string | null
    quantity: number | null
    buyPrice: number | null
    sku: string | null
    supplierCode: string | null
    barcode: string | null
  }
  warnings: string[]
  status: 'ready' | 'warning'
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

interface ParsedSpecification {
  specificationId: number
  key: string
  name: string
  type?: string
  unit?: string | null
  optionId?: number | null
  optionLabel?: string | null
  valueText?: string | null
  valueNumber?: number | null
  valueBoolean?: boolean | null
  displayValue?: string | null
}

interface MissingSpecification {
  id: number
  key: string
  name: string
}

interface MobiRow {
  rowNumber: number
  source?: {
    name?: string
    quantity?: number | null
    buyPrice?: number | null
    sku?: string | null
    supplierCode?: string | null
    barcode?: string | null
  }
  brand?: {
    id: number
    name: string
  } | null
  category?: {
    id: number
    name: string
  } | null
  specifications?: ParsedSpecification[]
  missingSpecifications?: MissingSpecification[]
  missingSpecificationsCount?: number
  matchedProduct?: {
    id: number
    name: string
  } | null
  warnings?: string[]
  status: 'ready' | 'review' | 'warning'
  confidence?: number
  confidencePercent?: number
}

interface MobiResult {
  rows: MobiRow[]
}

interface SupplierParsedSpecification {
  specificationId: number
  key: string
  name: string
  type: string
  unit: string | null
  optionId: number | null
  optionLabel: string | null
  valueText: string | null
  valueNumber: number | null
  valueBoolean: boolean | null
  displayValue: string
  source: 'supplier_description'
  confidence: number
}

interface SupplierDescriptionResult {
  success: boolean
  productName: string
  category: {
    id: number
    name: string
  }
  specifications: SupplierParsedSpecification[]
  parsedCount: number
  missingSpecifications: MissingSpecification[]
  missingSpecificationsCount: number
}

type SpecificationSourceChoice =
  | 'invoice'
  | 'supplier_description'

type ImportInputMode =
  | 'excel'
  | 'text'

const inputMode =
  ref<ImportInputMode>(
    'excel'
  )

const manualText =
  ref('')

const textLoading =
  ref(false)

const loading = ref(false)
const selectedFile = ref<File | null>(null)
const result = ref<ImportResult | null>(null)
const analyzing = ref(false)
const mobiResult = ref<MobiResult | null>(null)

const supplierDescriptions = reactive<Record<number, string>>({})
const descriptionLoading = reactive<Record<number, boolean>>({})
const descriptionResults = reactive<Record<number, SupplierDescriptionResult | null>>({})
const descriptionErrors = reactive<Record<number, string>>({})
const specificationChoices = reactive<Record<number, Record<number, SpecificationSourceChoice>>>({})
const manualSpecificationValues = reactive<Record<number, Record<number, string>>>({})

function clearReactiveObject(object: Record<number, any>) {
  for (const key of Object.keys(object)) {
    delete object[Number(key)]
  }
}

function resetDescriptionData() {
  clearReactiveObject(supplierDescriptions)
  clearReactiveObject(descriptionLoading)
  clearReactiveObject(descriptionResults)
  clearReactiveObject(descriptionErrors)
  clearReactiveObject(specificationChoices)
  clearReactiveObject(manualSpecificationValues)
}

function setInputMode(
  mode: ImportInputMode
) {
  inputMode.value = mode

  selectedFile.value = null
  manualText.value = ''
  result.value = null
  mobiResult.value = null
  clearReactiveObject(
    incomingQuantities
  )

  resetDescriptionData()

  if (
    typeof resetImportPreview ===
    'function'
  ) {
    resetImportPreview()
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  selectedFile.value = file
  result.value = null
  mobiResult.value = null
  resetDescriptionData()
}

async function analyzeText() {
  const text =
    manualText.value.trim()

  if (!text) {
    toast.add({
      title:
        'Вставте текст чека або накладної',
      color:
        'warning'
    })

    return
  }

  try {
    textLoading.value = true

    result.value =
      await $fetch<ImportResult>(
        '/api/admin/import/text',
        {
          method:
            'POST',

          body: {
            text
          }
        }
      )

    mobiResult.value = null
    resetDescriptionData()
    initializeResultQuantities()

    toast.add({
      title:
        'Текст розібрано',

      description:
        `Знайдено ${result.value.stats.total} позицій`,

      color:
        'success',

      icon:
        'i-lucide-list-checks'
    })
  }
  catch (error: any) {
    console.error(
      'Text import error:',
      error
    )

    toast.add({
      title:
        'Не вдалося розібрати текст',

      description:
        error?.data?.message ||
        error?.message ||
        'Помилка аналізу тексту',

      color:
        'error',

      icon:
        'i-lucide-circle-alert'
    })
  }
  finally {
    textLoading.value = false
  }
}

async function analyzeFile() {
  if (!selectedFile.value) {
    toast.add({
      title: 'Виберіть Excel файл',
      color: 'warning'
    })
    return
  }

  try {
    loading.value = true
    const data = new FormData()
    data.append('file', selectedFile.value)

    result.value = await $fetch<ImportResult>(
      '/api/admin/import/excel',
      {
        method: 'POST',
        body: data
      }
    )

    mobiResult.value = null
    resetDescriptionData()

    toast.add({
      title: 'Накладну прочитано',
      description: `Знайдено ${result.value.stats.total} позицій`,
      color: 'success',
      icon: 'i-lucide-file-check-2'
    })
  }
  catch (error: any) {
    console.error('Excel import error:', error)

    toast.add({
      title: 'Не вдалося прочитати накладну',
      description:
        error?.data?.message ||
        error?.message ||
        'Помилка Excel',
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
  finally {
    loading.value = false
  }
}

function resetImport() {
  selectedFile.value = null
  manualText.value = ''
  result.value = null
  mobiResult.value = null
  clearReactiveObject(
    incomingQuantities
  )
  resetDescriptionData()

  if (
    typeof resetImportPreview ===
    'function'
  ) {
    resetImportPreview()
  }
}

function formatPrice(value: number | null) {
  if (value === null) return '—'

  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 2
  }).format(value)
}

function formatQuantity(value: number | null) {
  if (value === null) return '—'
  return value
}

function getInvoiceRow(rowNumber: number) {
  return result.value?.rows.find(row => row.rowNumber === rowNumber) ?? null
}

function getRowName(row: MobiRow) {
  return row.source?.name || getInvoiceRow(row.rowNumber)?.parsed.name || 'Без назви'
}

function initializeResultQuantities() {
  if (!result.value) {
    return
  }

  for (
    const row
    of result.value.rows
  ) {
    incomingQuantities[
      row.rowNumber
    ] =
      row.parsed.quantity ===
        null ||
      row.parsed.quantity ===
        undefined
        ? ''
        : String(
            row.parsed.quantity
          )
  }
}

function getResultQuantity(
  rowNumber: number
): number | null {
  const raw =
    incomingQuantities[
      rowNumber
    ]

  if (
    raw === undefined ||
    raw === null ||
    String(raw).trim() === ''
  ) {
    return null
  }

  const value =
    Number(
      String(raw)
        .replace(',', '.')
        .trim()
    )

  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    return null
  }

  return value
}

function getRowQuantity(row: MobiRow) {
  if (row.source?.quantity !== undefined && row.source?.quantity !== null) {
    return row.source.quantity
  }

  return getInvoiceRow(row.rowNumber)?.parsed.quantity ?? null
}

function getRowBuyPrice(row: MobiRow) {
  if (row.source?.buyPrice !== undefined && row.source?.buyPrice !== null) {
    return row.source.buyPrice
  }

  return getInvoiceRow(row.rowNumber)?.parsed.buyPrice ?? null
}

async function analyzeWithMobi() {
  if (!result.value) return

  try {
    analyzing.value = true
    mobiResult.value = null
    resetDescriptionData()

    const rows = result.value.rows.map(row => ({
      rowNumber: row.rowNumber,
      name: row.parsed.name,
      supplierCategory: row.parsed.supplierCategory ?? null,
      quantity:
        getResultQuantity(
          row.rowNumber
        ),
      buyPrice: row.parsed.buyPrice,
      sku: row.parsed.sku ?? null,
      supplierCode: row.parsed.supplierCode ?? null,
      barcode: row.parsed.barcode ?? null
    }))

    mobiResult.value = await $fetch<MobiResult>(
      '/api/admin/import/analyze',
      {
        method: 'POST',
        body: { rows }
      }
    )

    initializeImportChoices()
    initializeCatalogNames()
    initializeIncomingQuantities()

    toast.add({
      title: 'Аналіз завершено',
      description: 'Mobi розпізнав товари з приходу.',
      color: 'success'
    })
  }
  catch (error: any) {
    console.error('Mobi analyze error:', error)

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

async function parseSupplierDescription(row: MobiRow) {
  const text = supplierDescriptions[row.rowNumber]?.trim()

  if (!text) {
    toast.add({
      title: 'Вставте опис постачальника',
      color: 'warning'
    })
    return
  }

  if (!row.category?.id) {
    toast.add({
      title: 'Категорію не визначено',
      description: 'Спочатку Mobi повинен визначити категорію товару.',
      color: 'warning'
    })
    return
  }

  try {
    descriptionLoading[row.rowNumber] = true
    descriptionErrors[row.rowNumber] = ''
    descriptionResults[row.rowNumber] = null
    specificationChoices[row.rowNumber] = {}
    manualSpecificationValues[row.rowNumber] = {}

    const response = await $fetch<SupplierDescriptionResult>(
      '/api/admin/import/description',
      {
        method: 'POST',
        body: {
          text,
          productName: getRowName(row),
          categoryId: row.category.id
        }
      }
    )

    descriptionResults[row.rowNumber] = response

    toast.add({
      title: 'Опис розпізнано',
      description: `Знайдено ${response.parsedCount} характеристик`,
      color: 'success'
    })
  }
  catch (error: any) {
    console.error('Supplier description error:', error)

    const message =
      error?.data?.message ||
      error?.message ||
      'Не вдалося розпізнати опис'

    descriptionErrors[row.rowNumber] = message

    toast.add({
      title: 'Помилка розпізнавання опису',
      description: message,
      color: 'error'
    })
  }
  finally {
    descriptionLoading[row.rowNumber] = false
  }
}

function getSpecificationValue(specification: any): string | null {
  if (!specification) return null

  if (specification.optionLabel !== null && specification.optionLabel !== undefined) {
    return String(specification.optionLabel)
  }

  if (specification.valueNumber !== null && specification.valueNumber !== undefined) {
    return String(specification.valueNumber)
  }

  if (specification.valueBoolean !== null && specification.valueBoolean !== undefined) {
    return specification.valueBoolean ? 'Так' : 'Ні'
  }

  if (specification.valueText !== null && specification.valueText !== undefined) {
    return String(specification.valueText)
  }

  if (specification.displayValue !== null && specification.displayValue !== undefined) {
    return String(specification.displayValue)
  }

  return null
}

function normalizeSpecificationValue(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .trim()
}

function getOriginalSpecification(
  row: MobiRow,
  specification: SupplierParsedSpecification
) {
  return row.specifications?.find(
    item => item.specificationId === specification.specificationId
  ) ?? null
}

function hasSpecificationConflict(
  row: MobiRow,
  specification: SupplierParsedSpecification
) {
  const original = getOriginalSpecification(row, specification)
  if (!original) return false

  const invoiceValue = getSpecificationValue(original)
  const supplierValue = getSpecificationValue(specification)

  if (invoiceValue === null || supplierValue === null) return false

  return normalizeSpecificationValue(invoiceValue) !== normalizeSpecificationValue(supplierValue)
}

function setManualSpecificationValue(
  rowNumber: number,
  specificationId: number,
  value: string
) {
  if (!manualSpecificationValues[rowNumber]) {
    manualSpecificationValues[rowNumber] = {}
  }

  manualSpecificationValues[rowNumber][specificationId] = value

  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false
}

function clearManualSpecificationValue(
  rowNumber: number,
  specificationId: number
) {
  const values = manualSpecificationValues[rowNumber]
  if (!values) return
  delete values[specificationId]
}

function selectSpecificationSource(
  rowNumber: number,
  specificationId: number,
  source: SpecificationSourceChoice
) {
  if (!specificationChoices[rowNumber]) {
    specificationChoices[rowNumber] = {}
  }

  specificationChoices[rowNumber][specificationId] = source

  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false
}

function getFinalSpecifications(row: MobiRow) {
  const invoiceSpecifications = row.specifications ?? []
  const supplierResult = descriptionResults[row.rowNumber]
  const supplierSpecifications = supplierResult?.specifications ?? []

  const map = new Map<number, {
    specificationId: number
    key: string
    name: string
    unit: string | null
    required: boolean
    invoice: ParsedSpecification | null
    supplier: SupplierParsedSpecification | null
  }>()

  for (const spec of invoiceSpecifications) {
    if (!spec.specificationId) continue

    map.set(spec.specificationId, {
      specificationId: spec.specificationId,
      key: spec.key,
      name: spec.name,
      unit: spec.unit ?? null,
      required: false,
      invoice: spec,
      supplier: null
    })
  }

  for (const spec of supplierSpecifications) {
    const current = map.get(spec.specificationId)

    if (current) {
      current.supplier = spec
      if (!current.unit) current.unit = spec.unit ?? null
      continue
    }

    map.set(spec.specificationId, {
      specificationId: spec.specificationId,
      key: spec.key,
      name: spec.name,
      unit: spec.unit ?? null,
      required: false,
      invoice: null,
      supplier: spec
    })
  }

  for (const missing of row.missingSpecifications ?? []) {
    const current = map.get(missing.id)

    if (current) {
      current.required = true
      continue
    }

    map.set(missing.id, {
      specificationId: missing.id,
      key: missing.key,
      name: missing.name,
      unit: null,
      required: true,
      invoice: null,
      supplier: null
    })
  }

  for (const missing of supplierResult?.missingSpecifications ?? []) {
    if (map.has(missing.id)) continue

    map.set(missing.id, {
      specificationId: missing.id,
      key: missing.key,
      name: missing.name,
      unit: null,
      required: true,
      invoice: null,
      supplier: null
    })
  }

  return Array.from(map.values()).map(item => {
    const invoiceValue = getSpecificationValue(item.invoice)
    const supplierValue = getSpecificationValue(item.supplier)

    const hasInvoice = invoiceValue !== null
    const hasSupplier = supplierValue !== null

    const conflict =
      hasInvoice &&
      hasSupplier &&
      normalizeSpecificationValue(invoiceValue) !==
        normalizeSpecificationValue(supplierValue)

    let selectedSource: SpecificationSourceChoice | null = null

    if (!conflict) {
      if (hasInvoice) selectedSource = 'invoice'
      else if (hasSupplier) selectedSource = 'supplier_description'
    }
    else {
      selectedSource =
        specificationChoices[row.rowNumber]?.[item.specificationId] ?? null
    }

    const manualValue =
      manualSpecificationValues[row.rowNumber]?.[item.specificationId]?.trim() || null

    let finalValue: string | null = null
    let finalSource:
      | 'manual'
      | 'invoice'
      | 'supplier_description'
      | null = null

    if (manualValue) {
      finalValue = manualValue
      finalSource = 'manual'
    }
    else if (selectedSource === 'invoice') {
      finalValue = invoiceValue
      finalSource = 'invoice'
    }
    else if (selectedSource === 'supplier_description') {
      finalValue = supplierValue
      finalSource = 'supplier_description'
    }

    return {
      ...item,
      invoiceValue,
      supplierValue,
      manualValue,
      conflict,
      selectedSource,
      finalValue,
      finalSource
    }
  })
}

function getUnresolvedConflicts(row: MobiRow) {
  return getFinalSpecifications(row).filter(
    spec => spec.conflict && !spec.manualValue && !spec.selectedSource
  )
}

function getMissingFinalSpecifications(row: MobiRow) {
  return getFinalSpecifications(row).filter(
    spec => spec.required && !spec.finalValue
  )
}

function isProductReady(row: MobiRow) {
  return Boolean(row.brand?.id && row.category?.id) &&
    getUnresolvedConflicts(row).length === 0 &&
    getMissingFinalSpecifications(row).length === 0
}

/* ==================================================
   CATALOG NAME
================================================== */

const catalogNames =
  reactive<Record<number, string>>({})


const incomingQuantities =
  reactive<Record<number, string>>({})

function cleanCatalogName(value: unknown) {
  let name = String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const prefixes = [
    /^смартфон\s+/i,
    /^мобільний\s+телефон\s+/i,
    /^мобильный\s+телефон\s+/i,
    /^телефон\s+/i,
    /^планшет\s+/i,
    /^планшетний\s+комп['’]?ютер\s+/i,
    /^мережевий\s+зарядний\s+пристрій\s+/i,
    /^сетевое\s+зарядное\s+устройство\s+/i,
    /^зарядний\s+пристрій\s+/i,
    /^зарядное\s+устройство\s+/i,
    /^навушники\s+/i,
    /^наушники\s+/i,
    /^чохол\s+/i,
    /^чехол\s+/i,
    /^захисне\s+скло\s+/i,
    /^защитное\s+стекло\s+/i,
    /^кабель\s+/i,
    /^павербанк\s+/i,
    /^power\s*bank\s+/i
  ]

  let changed = true

  while (changed) {
    changed = false

    for (const prefix of prefixes) {
      const cleaned = name.replace(prefix, '')

      if (cleaned !== name) {
        name = cleaned.trim()
        changed = true
        break
      }
    }
  }

  return name
}

function initializeCatalogNames() {
  if (!mobiResult.value) return

  for (const row of mobiResult.value.rows) {
    catalogNames[row.rowNumber] =
      cleanCatalogName(getRowName(row))
  }
}


function initializeIncomingQuantities() {
  if (!mobiResult.value) {
    return
  }

  for (
    const row
    of mobiResult.value.rows
  ) {
    if (
      incomingQuantities[
        row.rowNumber
      ] !== undefined
    ) {
      continue
    }

    const value =
      getRowQuantity(row)

    incomingQuantities[
      row.rowNumber
    ] =
      value === null ||
      value === undefined
        ? ''
        : String(value)
  }
}

function setIncomingQuantity(
  rowNumber: number,
  value: string
) {
  incomingQuantities[
    rowNumber
  ] = value

  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false
}

function getIncomingQuantity(
  row: MobiRow
): number | null {
  const raw =
    incomingQuantities[
      row.rowNumber
    ]

  if (
    raw === undefined ||
    raw === null ||
    String(raw).trim() === ''
  ) {
    return null
  }

  const value =
    Number(
      String(raw)
        .replace(',', '.')
        .trim()
    )

  if (
    !Number.isInteger(
      value
    ) ||
    value < 0
  ) {
    return null
  }

  return value
}

function setCatalogName(
  rowNumber: number,
  value: string
) {
  catalogNames[rowNumber] = value
  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false
}

function getCatalogName(row: MobiRow) {
  return String(
    catalogNames[row.rowNumber] ??
    cleanCatalogName(getRowName(row))
  ).trim()
}

/* ==================================================
   IMPORT PREVIEW
================================================== */

type ImportActionChoice =
  | 'create'
  | 'update'

interface ImportPreviewSpecification {
  specificationId: number
  name: string
  key: string
  value: string
  normalizedValue:
    | string
    | number
    | boolean
    | null
  optionId: number | null
}

interface ImportPreviewRow {
  rowNumber: number
  name: string

  action:
    | 'create'
    | 'update'
    | 'blocked'

  requestedAction:
    | ImportActionChoice
    | null

  ready: boolean

  matchedProduct: {
    id: number
    name: string
    quantity: number
    buyPrice: number
    sellPrice: number
  } | null

  quantity: {
    incoming: number
    before: number | null
    after: number | null
  }

  buyPrice: {
    incoming: number
    before: number | null
    after: number
  }

  sellPrice: {
    incoming: number | null
    before: number | null
    after: number | null
  }

  specifications:
    ImportPreviewSpecification[]

  errors: string[]
  warnings: string[]
}

interface ImportPreviewResult {
  success: boolean

  stats: {
    total: number
    create: number
    update: number
    blocked: number
  }

  rows: ImportPreviewRow[]
}


interface ImportCommitRow {
  rowNumber: number
  name: string
  action:
    | 'created'
    | 'updated'
    | 'skipped'
  productId: number | null
  message: string
  warnings: string[]
}

interface ImportCommitResult {
  success: boolean

  stats: {
    total: number
    created: number
    updated: number
    skipped: number
  }

  rows: ImportCommitRow[]
}

const importActionChoices =
  reactive<
    Record<
      number,
      ImportActionChoice | null
    >
  >({})

const sellPrices =
  reactive<
    Record<number, string>
  >({})

const previewLoading =
  ref(false)

const importPreview =
  ref<
    ImportPreviewResult | null
  >(null)


const commitLoading =
  ref(false)

const importCommit =
  ref<
    ImportCommitResult | null
  >(null)

const importCompleted =
  ref(false)

const readyImportCount =
  computed(() => {
    if (!importPreview.value) {
      return 0
    }

    return (
      importPreview.value.stats.create +
      importPreview.value.stats.update
    )
  })

function resetImportPreview() {
  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false

  for (
    const key
    of Object.keys(
      importActionChoices
    )
  ) {
    delete importActionChoices[
      Number(key)
    ]
  }

  for (
    const key
    of Object.keys(
      sellPrices
    )
  ) {
    delete sellPrices[
      Number(key)
    ]
  }
}

function initializeImportChoices() {
  resetImportPreview()

  if (!mobiResult.value) {
    return
  }

  for (
    const row
    of mobiResult.value.rows
  ) {
    importActionChoices[
      row.rowNumber
    ] =
      row.matchedProduct
        ? null
        : 'create'

    sellPrices[
      row.rowNumber
    ] = ''
  }
}

function setImportAction(
  rowNumber: number,
  action: ImportActionChoice
) {
  importActionChoices[
    rowNumber
  ] = action

  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false
}

function setSellPrice(
  rowNumber: number,
  value: string
) {
  sellPrices[
    rowNumber
  ] = value

  importPreview.value = null
  importCommit.value = null
  importCompleted.value = false
}

function getSellPrice(
  rowNumber: number
) {
  const normalized =
    String(
      sellPrices[
        rowNumber
      ] ?? ''
    )
      .replace(/\s+/g, '')
      .replace(',', '.')

  if (!normalized) {
    return null
  }

  const value =
    Number(normalized)

  return Number.isFinite(value)
    ? value
    : null
}

function getImportAction(
  row: MobiRow
) {
  return (
    importActionChoices[
      row.rowNumber
    ] ??
    null
  )
}

function isImportChoiceReady(
  row: MobiRow
) {
  if (!getCatalogName(row)) {
    return false
  }

  if (
    getIncomingQuantity(row) ===
    null
  ) {
    return false
  }

  const action =
    getImportAction(row)

  if (!action) {
    return false
  }

  if (
    action === 'create'
  ) {
    const sellPrice =
      getSellPrice(
        row.rowNumber
      )

    if (
      sellPrice === null ||
      sellPrice <= 0
    ) {
      return false
    }
  }

  return true
}

function buildPreviewRows() {
  if (!mobiResult.value) {
    return []
  }

  return mobiResult.value.rows.map(
    row => ({
      rowNumber:
        row.rowNumber,

      name:
        getCatalogName(row),

      brandId:
        row.brand?.id ??
        null,

      categoryId:
        row.category?.id ??
        null,

      quantity:
        getIncomingQuantity(row),

      buyPrice:
        getRowBuyPrice(row),

      sellPrice:
        getSellPrice(
          row.rowNumber
        ),

      matchedProductId:
        row.matchedProduct?.id ??
        null,

      requestedAction:
        getImportAction(row),

      specifications:
        getFinalSpecifications(
          row
        )
          .filter(
            spec =>
              spec.finalValue !==
              null
          )
          .map(
            spec => ({
              specificationId:
                spec.specificationId,

              value:
                String(
                  spec.finalValue
                )
            })
          )
    })
  )
}

async function previewImport() {
  if (!mobiResult.value) {
    return
  }

  try {
    previewLoading.value = true
    importPreview.value = null
    importCommit.value = null
    importCompleted.value = false

    importPreview.value =
      await $fetch<
        ImportPreviewResult
      >(
        '/api/admin/import/preview',
        {
          method:
            'POST',

          body: {
            rows:
              buildPreviewRows()
          }
        }
      )

    if (
      importPreview.value
        .stats.blocked > 0
    ) {
      toast.add({
        title:
          'Попередній перегляд готовий',

        description:
          `Потрібно виправити ${importPreview.value.stats.blocked} позицій.`,

        color:
          'warning'
      })
    }
    else {
      toast.add({
        title:
          'Усе готово до імпорту',

        description:
          `Створити: ${importPreview.value.stats.create}, оновити: ${importPreview.value.stats.update}.`,

        color:
          'success'
      })
    }
  }
  catch (error: any) {
    console.error(
      'Import preview error:',
      error
    )

    toast.add({
      title:
        'Помилка перевірки імпорту',

      description:
        error?.data?.message ||
        error?.message ||
        'Не вдалося сформувати попередній перегляд',

      color:
        'error'
    })
  }
  finally {
    previewLoading.value = false
  }
}


async function commitImport() {
  if (
    !importPreview.value ||
    readyImportCount.value <= 0 ||
    importCompleted.value
  ) {
    return
  }

  const createCount =
    importPreview.value.stats.create

  const updateCount =
    importPreview.value.stats.update

  const blockedCount =
    importPreview.value.stats.blocked

  const confirmed =
    window.confirm(
      [
        'Записати прихід у базу даних?',
        '',
        `Створити нових: ${createCount}`,
        `Оновити існуючих: ${updateCount}`,
        blockedCount
          ? `Пропустити заблокованих: ${blockedCount}`
          : 'Заблокованих позицій немає',
        '',
        'Для оновлення кількість буде ДОДАНА до існуючого залишку.'
      ].join('\\n')
    )

  if (!confirmed) {
    return
  }

  try {
    commitLoading.value = true
    importCommit.value = null

    importCommit.value =
      await $fetch<
        ImportCommitResult
      >(
        '/api/admin/import/commit',
        {
          method:
            'POST',

          body: {
            rows:
              buildPreviewRows()
          }
        }
      )

    const imported =
      importCommit.value.stats.created +
      importCommit.value.stats.updated

    importCompleted.value =
      imported > 0

    toast.add({
      title:
        'Прихід записано в базу',

      description:
        `Створено: ${importCommit.value.stats.created}, оновлено: ${importCommit.value.stats.updated}, пропущено: ${importCommit.value.stats.skipped}.`,

      color:
        'success',

      icon:
        'i-lucide-database-check'
    })
  }
  catch (error: any) {
    console.error(
      'Import commit error:',
      error
    )

    toast.add({
      title:
        'Помилка запису в базу',

      description:
        error?.data?.message ||
        error?.message ||
        'Не вдалося виконати імпорт',

      color:
        'error',

      icon:
        'i-lucide-circle-alert'
    })
  }
  finally {
    commitLoading.value = false
  }
}

</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Імпорт товарів"
      description="Завантаження та аналіз накладної постачальника"
    />

    <UiSectionCard
      title="Джерело приходу"
      description="Excel-файл або ручне введення тексту з чека / накладної"
    >
      <!-- SOURCE MODE -->

      <div
        class="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        <button
          type="button"
          class="
            rounded-xl
            border
            p-4
            text-left
            transition
          "
          :class="
            inputMode === 'excel'
              ? 'border-primary bg-primary/10'
              : 'border-default hover:bg-elevated'
          "
          @click="
            setInputMode(
              'excel'
            )
          "
        >
          <div
            class="
              flex
              items-center
              gap-3
            "
          >
            <div
              class="
                flex
                size-10
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-primary/10
              "
            >
              <UIcon
                name="i-lucide-file-spreadsheet"
                class="
                  size-5
                  text-primary
                "
              />
            </div>

            <div>
              <div class="font-semibold">
                Excel
              </div>

              <div
                class="
                  mt-1
                  text-xs
                  text-muted
                "
              >
                Завантажити .xlsx або .xls
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          class="
            rounded-xl
            border
            p-4
            text-left
            transition
          "
          :class="
            inputMode === 'text'
              ? 'border-primary bg-primary/10'
              : 'border-default hover:bg-elevated'
          "
          @click="
            setInputMode(
              'text'
            )
          "
        >
          <div
            class="
              flex
              items-center
              gap-3
            "
          >
            <div
              class="
                flex
                size-10
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-primary/10
              "
            >
              <UIcon
                name="i-lucide-receipt-text"
                class="
                  size-5
                  text-primary
                "
              />
            </div>

            <div>
              <div class="font-semibold">
                Текст / чек
              </div>

              <div
                class="
                  mt-1
                  text-xs
                  text-muted
                "
              >
                Вставити список товарів вручну
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- EXCEL -->

      <div
        v-if="
          inputMode ===
          'excel'
        "
        class="
          mt-4
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
            gap-4
            text-center
          "
        >
          <UIcon
            name="i-lucide-file-spreadsheet"
            class="
              size-8
              text-primary
            "
          />

          <div>
            <div class="font-semibold">
              Виберіть накладну
            </div>

            <div
              class="
                mt-1
                text-sm
                text-muted
              "
            >
              Дані поки не записуються у базу
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
              class="
                mr-2
                size-4
              "
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
            {{ selectedFile.name }}
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
              Аналізувати Excel
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

      <!-- TEXT / RECEIPT -->

      <div
        v-else
        class="
          mt-4
          rounded-xl
          border
          border-default
          p-4
          sm:p-5
        "
      >
        <div
          class="
            flex
            items-start
            gap-3
          "
        >
          <div
            class="
              flex
              size-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary/10
            "
          >
            <UIcon
              name="i-lucide-receipt-text"
              class="
                size-5
                text-primary
              "
            />
          </div>

          <div>
            <div class="font-semibold">
              Введіть прихід текстом
            </div>

            <div
              class="
                mt-1
                text-sm
                text-muted
              "
            >
              Один товар — один рядок. Можна вставити текст,
              скопійований із чека, накладної або сайту.
            </div>
          </div>
        </div>

        <UTextarea
          v-model="manualText"
          :rows="10"
          autoresize
          class="
            mt-4
            w-full
          "
          placeholder="Наприклад:
Samsung Galaxy A07 4/128GB Black | 2 | 3890
Motorola Moto G06 4/128GB Arabesque | 1 | 2990
Samsung EP-T4511 45W White | 3 | 1100

Також можна:
Samsung Galaxy A07 4/128GB Black 2 шт 3890 грн"
        />

        <div
          class="
            mt-3
            rounded-lg
            bg-info/10
            p-3
            text-xs
            text-muted
          "
        >
          Найнадійніший формат:
          <strong>
            Назва | кількість | закупівельна ціна
          </strong>.
          Якщо кількість або ціну не вдалося визначити,
          товар усе одно піде в Mobi, але буде позначений
          для перевірки.
        </div>

        <div
          class="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <UButton
            icon="i-lucide-list-checks"
            :loading="textLoading"
            @click="
              analyzeText
            "
          >
            Розібрати текст
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
    </UiSectionCard>

    <template v-if="result">
      <UiSectionCard title="Результат аналізу">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-elevated p-4">
            <div class="text-sm text-muted">Файл</div>
            <div class="mt-1 break-all font-medium">{{ result.fileName }}</div>
          </div>

          <div class="rounded-xl bg-elevated p-4">
            <div class="text-sm text-muted">Лист</div>
            <div class="mt-1 font-medium">{{ result.sheetName }}</div>
          </div>

          <div class="rounded-xl bg-elevated p-4">
            <div class="text-sm text-muted">Рядок заголовків</div>
            <div class="mt-1 text-xl font-bold">{{ result.headerRow }}</div>
          </div>

          <div class="rounded-xl bg-elevated p-4">
            <div class="text-sm text-muted">Позицій</div>
            <div class="mt-1 text-xl font-bold">{{ result.stats.total }}</div>
          </div>
        </div>
      </UiSectionCard>

      <UiSectionCard
        title="Розпізнані колонки"
        description="Перевір, чи правильно система зрозуміла вихідні дані"
      >
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            Товар: {{ result.detectedColumns.name || '—' }}
          </UBadge>

          <UBadge
            :color="result.detectedColumns.quantity ? 'success' : 'warning'"
            variant="soft"
          >
            Кількість: {{ result.detectedColumns.quantity || '—' }}
          </UBadge>

          <UBadge
            :color="result.detectedColumns.price ? 'success' : 'warning'"
            variant="soft"
          >
            Ціна: {{ result.detectedColumns.price || '—' }}
          </UBadge>

          <UBadge color="neutral" variant="soft">
            Артикул: {{ result.detectedColumns.sku || '—' }}
          </UBadge>

          <UBadge color="neutral" variant="soft">
            Штрихкод: {{ result.detectedColumns.barcode || '—' }}
          </UBadge>
        </div>
      </UiSectionCard>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-default p-4">
          <div class="text-sm text-muted">Всього</div>
          <div class="mt-1 text-2xl font-bold">{{ result.stats.total }}</div>
        </div>

        <div class="rounded-xl border border-success/30 p-4">
          <div class="text-sm text-muted">Готові</div>
          <div class="mt-1 text-2xl font-bold text-success">{{ result.stats.ready }}</div>
        </div>

        <div class="rounded-xl border border-warning/30 p-4">
          <div class="text-sm text-muted">Перевірити</div>
          <div class="mt-1 text-2xl font-bold text-warning">{{ result.stats.warning }}</div>
        </div>
      </div>

      <UiSectionCard
        title="Товари приходу"
        description="Попередній перегляд перед розпізнаванням Mobi"
      >
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[800px] text-sm">
            <thead>
              <tr class="border-b border-default text-left text-muted">
                <th class="p-3">#</th>
                <th class="p-3">Товар</th>
                <th class="p-3">Категорія</th>
                <th class="p-3">К-сть</th>
                <th class="p-3">Закупка</th>
                <th class="p-3">Статус</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in result.rows"
                :key="row.rowNumber"
                class="border-b border-default"
              >
                <td class="p-3">{{ row.rowNumber }}</td>
                <td class="p-3 font-medium">{{ row.parsed.name }}</td>
                <td class="p-3">{{ row.parsed.supplierCategory || '—' }}</td>
                <td class="p-3">
                  <UInput
                    :model-value="
                      incomingQuantities[
                        row.rowNumber
                      ] ?? ''
                    "
                    type="number"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    class="w-24"
                    @update:model-value="
                      setIncomingQuantity(
                        row.rowNumber,
                        String($event ?? '')
                      )
                    "
                  />
                </td>
                <td class="p-3">{{ formatPrice(row.parsed.buyPrice) }} грн</td>
                <td class="p-3">
                  <UBadge
                    :color="row.status === 'ready' ? 'success' : 'warning'"
                    variant="soft"
                  >
                    {{ row.status === 'ready' ? 'Готово' : 'Перевірити' }}
                  </UBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 md:hidden">
          <div
            v-for="row in result.rows"
            :key="row.rowNumber"
            class="rounded-xl border border-default p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="break-words font-semibold">{{ row.parsed.name }}</div>
                <div class="mt-1 text-xs text-muted">Рядок {{ row.rowNumber }}</div>
              </div>

              <UBadge
                :color="row.status === 'ready' ? 'success' : 'warning'"
                variant="soft"
              >
                {{ row.status === 'ready' ? 'Готово' : 'Перевірити' }}
              </UBadge>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-muted">Кількість</div>
                <UInput
                  :model-value="
                    incomingQuantities[
                      row.rowNumber
                    ] ?? ''
                  "
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  class="mt-1 w-28"
                  @update:model-value="
                    setIncomingQuantity(
                      row.rowNumber,
                      String($event ?? '')
                    )
                  "
                />
              </div>

              <div>
                <div class="text-xs text-muted">Закупка</div>
                <div class="font-medium">{{ formatPrice(row.parsed.buyPrice) }} грн</div>
              </div>
            </div>

            <div
              v-if="row.warnings.length"
              class="mt-3 rounded-lg bg-warning/10 p-3"
            >
              <div
                v-for="warning in row.warnings"
                :key="warning"
                class="text-xs text-warning"
              >
                • {{ warning }}
              </div>
            </div>
          </div>
        </div>
      </UiSectionCard>

      <UButton
        icon="i-lucide-sparkles"
        size="lg"
        :loading="analyzing"
        @click="analyzeWithMobi"
      >
        Розпізнати товари Mobi
      </UButton>

      <div
        v-if="mobiResult"
        class="space-y-4"
      >
        <div
          v-for="row in mobiResult.rows"
          :key="row.rowNumber"
          class="rounded-xl border border-default p-4 sm:p-5"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="break-words text-base font-semibold">
                {{ getRowName(row) }}
              </div>
              <div class="mt-1 text-sm text-muted">Рядок {{ row.rowNumber }}</div>
            </div>

            <UBadge
              :color="row.status === 'ready' ? 'success' : row.status === 'review' ? 'warning' : 'error'"
              variant="soft"
            >
              {{ row.confidencePercent ?? 0 }}%
            </UBadge>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-lg bg-elevated p-3">
              <div class="text-xs text-muted">Бренд</div>
              <div class="font-medium">{{ row.brand?.name || 'Не визначено' }}</div>
            </div>

            <div class="rounded-lg bg-elevated p-3">
              <div class="text-xs text-muted">Категорія</div>
              <div class="font-medium">{{ row.category?.name || 'Не визначено' }}</div>
            </div>
          </div>

          <div
            v-if="row.specifications?.length"
            class="mt-4"
          >
            <div class="mb-2 text-xs text-muted">
              Розпізнані характеристики з накладної
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="spec in row.specifications"
                :key="spec.specificationId"
                color="neutral"
                variant="soft"
              >
                {{ spec.name }}: {{ spec.displayValue }}
              </UBadge>
            </div>
          </div>

          <div
            v-if="row.missingSpecificationsCount"
            class="mt-4 rounded-lg bg-info/10 p-3"
          >
            <div class="flex items-center gap-2 text-sm font-medium">
              <UIcon
                name="i-lucide-info"
                class="size-4"
              />
              Потрібно доповнити: {{ row.missingSpecificationsCount }}
            </div>

            <div
              v-if="row.missingSpecifications?.length"
              class="mt-2 text-xs leading-relaxed text-muted"
            >
              {{ row.missingSpecifications.map(spec => spec.name).join(', ') }}
            </div>
          </div>

          <div class="mt-5 rounded-xl border border-default p-4">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="font-semibold">Додатковий опис постачальника</div>
                <div class="mt-1 text-xs text-muted">
                  Вставте повний опис товару з сайту постачальника
                </div>
              </div>

              <UBadge
                v-if="descriptionResults[row.rowNumber]"
                color="success"
                variant="soft"
              >
                {{ descriptionResults[row.rowNumber]?.parsedCount }} знайдено
              </UBadge>
            </div>

            <UTextarea
              v-model="supplierDescriptions[row.rowNumber]"
              :rows="6"
              class="mt-3 w-full"
              placeholder="Вставте сюди опис товару..."
            />

            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                icon="i-lucide-scan-text"
                :loading="descriptionLoading[row.rowNumber]"
                :disabled="!row.category?.id"
                @click="parseSupplierDescription(row)"
              >
                Розпізнати характеристики
              </UButton>
            </div>

            <div
              v-if="descriptionErrors[row.rowNumber]"
              class="mt-3 rounded-lg bg-error/10 p-3 text-sm text-error"
            >
              {{ descriptionErrors[row.rowNumber] }}
            </div>

            <div
              v-if="descriptionResults[row.rowNumber]"
              class="mt-4 space-y-3"
            >
              <div v-if="descriptionResults[row.rowNumber]?.specifications.length">
                <div class="mb-2 text-xs text-muted">З опису знайдено</div>

                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    v-for="spec in descriptionResults[row.rowNumber]?.specifications"
                    :key="spec.specificationId"
                    class="rounded-lg border p-3"
                    :class="hasSpecificationConflict(row, spec) ? 'border-warning/50 bg-warning/10' : 'border-success/30 bg-success/5'"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="text-xs text-muted">{{ spec.name }}</div>

                      <UBadge
                        v-if="hasSpecificationConflict(row, spec)"
                        color="warning"
                        variant="soft"
                        size="sm"
                      >
                        Відрізняється
                      </UBadge>
                    </div>

                    <div class="mt-1 font-medium">{{ spec.displayValue }}</div>

                    <div
                      v-if="hasSpecificationConflict(row, spec)"
                      class="mt-2 text-xs text-warning"
                    >
                      У накладній:
                      {{ getSpecificationValue(getOriginalSpecification(row, spec)) }}
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="descriptionResults[row.rowNumber]?.missingSpecificationsCount"
                class="rounded-lg bg-info/10 p-3"
              >
                <div class="text-sm font-medium">
                  Після аналізу опису ще не знайдено:
                  {{ descriptionResults[row.rowNumber]?.missingSpecificationsCount }}
                </div>

                <div class="mt-1 text-xs text-muted">
                  {{ descriptionResults[row.rowNumber]?.missingSpecifications.map(spec => spec.name).join(', ') }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="descriptionResults[row.rowNumber]"
            class="mt-5 rounded-xl border border-primary/30 p-4"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="flex items-center gap-2 font-semibold">
                  <UIcon
                    name="i-lucide-clipboard-check"
                    class="size-5 text-primary"
                  />
                  Фінальна картка товару
                </div>

                <div class="mt-1 text-xs text-muted">
                  Саме ці значення підуть у майбутній імпорт
                </div>
              </div>

              <UBadge
                :color="isProductReady(row) ? 'success' : 'warning'"
                variant="soft"
              >
                {{ isProductReady(row) ? 'Готово' : 'Потрібна перевірка' }}
              </UBadge>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-lg bg-elevated p-3">
                <div class="text-xs text-muted">Бренд</div>
                <div class="font-medium">{{ row.brand?.name || 'Не визначено' }}</div>
              </div>

              <div class="rounded-lg bg-elevated p-3">
                <div class="text-xs text-muted">Категорія</div>
                <div class="font-medium">{{ row.category?.name || 'Не визначено' }}</div>
              </div>

              <div class="rounded-lg bg-elevated p-3">
                <div class="text-xs text-muted">Кількість</div>
                <div class="font-medium">{{ formatQuantity(getRowQuantity(row)) }}</div>
              </div>

              <div class="rounded-lg bg-elevated p-3">
                <div class="text-xs text-muted">Закупка</div>
                <div class="font-medium">{{ formatPrice(getRowBuyPrice(row)) }} грн</div>
              </div>
            </div>

            <div
              v-if="getUnresolvedConflicts(row).length"
              class="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning"
            >
              Невирішених конфліктів:
              <strong>{{ getUnresolvedConflicts(row).length }}</strong>
            </div>

            <div
              v-if="getMissingFinalSpecifications(row).length"
              class="mt-3 rounded-lg bg-info/10 p-3 text-sm"
            >
              Ще потрібно заповнити обов'язкових характеристик:
              <strong>{{ getMissingFinalSpecifications(row).length }}</strong>
            </div>

            <div class="mt-4 space-y-3">
              <div
                v-for="spec in getFinalSpecifications(row)"
                :key="spec.specificationId"
                class="rounded-xl border border-default p-3"
              >
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div class="font-medium">
                      {{ spec.name }}
                      <span
                        v-if="spec.required"
                        class="text-error"
                      >*</span>
                    </div>

                    <div class="mt-1 text-xs text-muted">key: {{ spec.key }}</div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-if="spec.finalSource === 'manual'"
                      color="warning"
                      variant="soft"
                      size="sm"
                    >
                      Вручну
                    </UBadge>

                    <UBadge
                      v-else-if="spec.finalSource === 'invoice'"
                      color="primary"
                      variant="soft"
                      size="sm"
                    >
                      Excel / Mobi
                    </UBadge>

                    <UBadge
                      v-else-if="spec.finalSource === 'supplier_description'"
                      color="success"
                      variant="soft"
                      size="sm"
                    >
                      Опис
                    </UBadge>

                    <UBadge
                      v-if="spec.conflict && !spec.manualValue && !spec.selectedSource"
                      color="warning"
                      variant="soft"
                      size="sm"
                    >
                      Конфлікт
                    </UBadge>
                  </div>
                </div>

                <div
                  v-if="spec.conflict && !spec.manualValue"
                  class="mt-3 space-y-2"
                >
                  <div class="text-xs text-warning">
                    Значення відрізняються. Виберіть правильне:
                  </div>

                  <button
                    type="button"
                    class="w-full rounded-lg border p-3 text-left transition"
                    :class="spec.selectedSource === 'invoice' ? 'border-primary bg-primary/10' : 'border-default hover:bg-elevated'"
                    @click="selectSpecificationSource(row.rowNumber, spec.specificationId, 'invoice')"
                  >
                    <div class="text-xs text-muted">Excel / Mobi</div>
                    <div class="mt-1 font-medium">
                      {{ spec.invoiceValue }}
                      <span
                        v-if="spec.unit && spec.invoiceValue && !String(spec.invoiceValue).includes(spec.unit)"
                      >
                        {{ spec.unit }}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="w-full rounded-lg border p-3 text-left transition"
                    :class="spec.selectedSource === 'supplier_description' ? 'border-success bg-success/10' : 'border-default hover:bg-elevated'"
                    @click="selectSpecificationSource(row.rowNumber, spec.specificationId, 'supplier_description')"
                  >
                    <div class="text-xs text-muted">Опис постачальника</div>
                    <div class="mt-1 font-medium">
                      {{ spec.supplierValue }}
                      <span
                        v-if="spec.unit && spec.supplierValue && !String(spec.supplierValue).includes(spec.unit)"
                      >
                        {{ spec.unit }}
                      </span>
                    </div>
                  </button>
                </div>

                <div class="mt-3 border-t border-default pt-3">
                  <div class="mb-2 flex items-center justify-between gap-2">
                    <div class="text-xs font-medium text-muted">Ручне значення</div>

                    <UButton
                      v-if="spec.manualValue"
                      type="button"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-x"
                      @click="clearManualSpecificationValue(row.rowNumber, spec.specificationId)"
                    >
                      Очистити
                    </UButton>
                  </div>

                  <UInput
                    :model-value="manualSpecificationValues[row.rowNumber]?.[spec.specificationId] ?? ''"
                    :placeholder="spec.finalValue ? `Поточне: ${spec.finalValue}` : 'Введіть значення'"
                    class="w-full"
                    @update:model-value="setManualSpecificationValue(row.rowNumber, spec.specificationId, String($event ?? ''))"
                  />
                </div>

                <div
                  v-if="spec.finalValue"
                  class="mt-3 rounded-lg bg-success/10 p-3"
                >
                  <div class="text-xs text-muted">Фінальне значення</div>

                  <div class="mt-1 flex items-center gap-2 font-semibold">
                    <UIcon
                      name="i-lucide-check"
                      class="size-4 text-success"
                    />

                    <span>
                      {{ spec.finalValue }}
                      <span
                        v-if="spec.unit && !String(spec.finalValue).includes(spec.unit)"
                      >
                        {{ spec.unit }}
                      </span>
                    </span>
                  </div>
                </div>

                <div
                  v-else
                  class="mt-3 rounded-lg bg-warning/10 p-3 text-sm text-warning"
                >
                  Значення поки не визначено
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="row.matchedProduct"
            class="mt-4 text-xs text-muted"
          >
            Схожий товар у базі:
            <strong>{{ row.matchedProduct.name }}</strong>
          </div>

          <div
            v-if="row.warnings?.length"
            class="mt-4 rounded-lg bg-warning/10 p-3"
          >
            <div class="mb-1 text-sm font-medium">Потрібна перевірка</div>

            <div
              v-for="warning in row.warnings"
              :key="warning"
              class="text-sm text-warning"
            >
              • {{ warning }}
            </div>
          </div>
        </div>
      </div>

      <!-- ==================================================
           IMPORT PREVIEW / CREATE VS UPDATE
      ================================================== -->

      <UiSectionCard
        v-if="mobiResult"
        title="Підготовка до імпорту"
        description="Оберіть, що робити з кожним товаром, і перевірте результат перед записом у базу"
      >
        <div class="space-y-4">
          <div
            v-for="row in mobiResult.rows"
            :key="`import-${row.rowNumber}`"
            class="rounded-xl border border-default p-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="break-words font-semibold">
                  {{ getRowName(row) }}
                </div>

                <div class="mt-1 text-xs text-muted">
                  Рядок {{ row.rowNumber }}
                </div>
              </div>

              <UBadge
                :color="
                  isProductReady(row) &&
                  isImportChoiceReady(row)
                    ? 'success'
                    : 'warning'
                "
                variant="soft"
              >
                {{
                  isProductReady(row) &&
                  isImportChoiceReady(row)
                    ? 'Готово'
                    : 'Потрібна перевірка'
                }}
              </UBadge>
            </div>

            <!-- INCOMING QUANTITY -->

            <div
              class="
                mt-4
                rounded-lg
                border
                border-default
                bg-elevated/40
                p-3
              "
            >
              <div class="text-sm font-medium">
                Кількість приходу
              </div>

              <div
                class="
                  mt-1
                  text-xs
                  text-muted
                "
              >
                Можна виправити кількість, яку система визначила з Excel або тексту.
              </div>

              <UInput
                :model-value="
                  incomingQuantities[
                    row.rowNumber
                  ] ?? ''
                "
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                class="mt-3 w-full sm:max-w-48"
                placeholder="Наприклад: 1"
                @update:model-value="
                  setIncomingQuantity(
                    row.rowNumber,
                    String($event ?? '')
                  )
                "
              />

              <div
                v-if="
                  getIncomingQuantity(row) ===
                  null
                "
                class="
                  mt-2
                  text-xs
                  text-error
                "
              >
                Вкажіть ціле число 0 або більше.
              </div>
            </div>

            <!-- CATALOG NAME -->

            <div
              class="
                mt-4
                rounded-lg
                border
                border-primary/30
                bg-primary/5
                p-3
              "
            >
              <div class="text-sm font-medium">
                Назва для каталогу
              </div>

              <div class="mt-1 text-xs text-muted">
                Саме ця назва буде записана в Product.name
              </div>

              <UInput
                :model-value="
                  catalogNames[
                    row.rowNumber
                  ] ?? ''
                "
                class="mt-3 w-full"
                placeholder="Назва товару в каталозі"
                @update:model-value="
                  setCatalogName(
                    row.rowNumber,
                    String($event ?? '')
                  )
                "
              />

              <div
                v-if="
                  getCatalogName(row) !==
                  getRowName(row)
                "
                class="mt-2 text-xs text-muted"
              >
                Оригінал постачальника:
                {{ getRowName(row) }}
              </div>

              <div
                v-if="!getCatalogName(row)"
                class="mt-2 text-xs text-error"
              >
                Назва для каталогу не може бути порожньою.
              </div>
            </div>

            <!-- ACTION CHOICE -->

            <div
              class="
                mt-4
                rounded-lg
                border
                border-default
                p-3
              "
            >
              <div class="text-sm font-medium">
                Що зробити з товаром?
              </div>

              <div
                v-if="row.matchedProduct"
                class="
                  mt-2
                  rounded-lg
                  bg-info/10
                  p-3
                  text-sm
                "
              >
                Знайдено схожий товар у базі:
                <strong>
                  {{ row.matchedProduct.name }}
                </strong>
              </div>

              <div
                v-else
                class="
                  mt-2
                  rounded-lg
                  bg-success/10
                  p-3
                  text-sm
                "
              >
                Схожого товару в базі не знайдено.
                Рекомендовано створити нову позицію.
              </div>

              <div
                class="
                  mt-3
                  grid
                  grid-cols-1
                  gap-2
                  sm:grid-cols-2
                "
              >
                <button
                  type="button"
                  class="
                    rounded-lg
                    border
                    p-3
                    text-left
                    transition
                  "
                  :class="
                    getImportAction(row) === 'create'
                      ? 'border-success bg-success/10'
                      : 'border-default hover:bg-elevated'
                  "
                  @click="
                    setImportAction(
                      row.rowNumber,
                      'create'
                    )
                  "
                >
                  <div class="font-medium">
                    Створити новий
                  </div>

                  <div class="mt-1 text-xs text-muted">
                    Буде створена нова позиція каталогу.
                  </div>
                </button>

                <button
                  type="button"
                  class="
                    rounded-lg
                    border
                    p-3
                    text-left
                    transition
                  "
                  :class="
                    row.matchedProduct
                      ? (
                          getImportAction(row) === 'update'
                            ? 'border-primary bg-primary/10'
                            : 'border-default hover:bg-elevated'
                        )
                      : 'cursor-not-allowed border-default opacity-40'
                  "
                  :disabled="!row.matchedProduct"
                  @click="
                    row.matchedProduct &&
                    setImportAction(
                      row.rowNumber,
                      'update'
                    )
                  "
                >
                  <div class="font-medium">
                    Оновити існуючий
                  </div>

                  <div class="mt-1 text-xs text-muted">
                    <template v-if="row.matchedProduct">
                      Кількість буде додана до залишку.
                      Продажна ціна залишиться існуючою.
                    </template>

                    <template v-else>
                      Недоступно — схожого товару не знайдено.
                    </template>
                  </div>
                </button>
              </div>
            </div>

            <div
              v-if="getImportAction(row) === 'create'"
              class="mt-4"
            >
              <div class="mb-2 text-sm font-medium">
                Продажна ціна, грн
              </div>

              <UInput
                :model-value="
                  sellPrices[
                    row.rowNumber
                  ] ?? ''
                "
                type="number"
                min="0"
                step="0.01"
                placeholder="Наприклад 5999"
                class="w-full sm:max-w-xs"
                @update:model-value="
                  setSellPrice(
                    row.rowNumber,
                    String($event ?? '')
                  )
                "
              />

              <div class="mt-1 text-xs text-muted">
                Для нового товару продажна ціна обов'язкова.
              </div>
            </div>

            <div
              v-if="!isProductReady(row)"
              class="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning"
            >
              Спочатку завершіть фінальну картку характеристик цього товару.
            </div>

            <div
              v-else-if="!isImportChoiceReady(row)"
              class="mt-4 rounded-lg bg-warning/10 p-3 text-sm text-warning"
            >
              {{
                row.matchedProduct &&
                !getImportAction(row)
                  ? 'Оберіть: оновити існуючий товар чи створити новий.'
                  : 'Вкажіть продажну ціну для нового товару.'
              }}
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <UButton
              icon="i-lucide-eye"
              size="lg"
              :loading="previewLoading"
              @click="previewImport"
            >
              Перевірити перед імпортом
            </UButton>

            <div class="text-xs text-muted">
              На цьому етапі база даних ще не змінюється.
            </div>
          </div>

          <!-- PREVIEW RESULT -->

          <div
            v-if="importPreview"
            class="space-y-4"
          >
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div class="rounded-xl border border-default p-3">
                <div class="text-xs text-muted">Всього</div>
                <div class="mt-1 text-xl font-bold">
                  {{ importPreview.stats.total }}
                </div>
              </div>

              <div class="rounded-xl border border-success/30 p-3">
                <div class="text-xs text-muted">Створити</div>
                <div class="mt-1 text-xl font-bold text-success">
                  {{ importPreview.stats.create }}
                </div>
              </div>

              <div class="rounded-xl border border-primary/30 p-3">
                <div class="text-xs text-muted">Оновити</div>
                <div class="mt-1 text-xl font-bold text-primary">
                  {{ importPreview.stats.update }}
                </div>
              </div>

              <div class="rounded-xl border border-warning/30 p-3">
                <div class="text-xs text-muted">Заблоковано</div>
                <div class="mt-1 text-xl font-bold text-warning">
                  {{ importPreview.stats.blocked }}
                </div>
              </div>
            </div>

            <div
              v-for="previewRow in importPreview.rows"
              :key="`preview-${previewRow.rowNumber}`"
              class="rounded-xl border border-default p-4"
            >
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div class="font-semibold">
                    {{ previewRow.name }}
                  </div>

                  <div class="mt-1 text-xs text-muted">
                    Рядок {{ previewRow.rowNumber }}
                  </div>
                </div>

                <UBadge
                  :color="
                    previewRow.action === 'create'
                      ? 'success'
                      : previewRow.action === 'update'
                        ? 'primary'
                        : 'warning'
                  "
                  variant="soft"
                >
                  {{
                    previewRow.action === 'create'
                      ? 'Створити'
                      : previewRow.action === 'update'
                        ? 'Оновити'
                        : 'Заблоковано'
                  }}
                </UBadge>
              </div>

              <div
                v-if="previewRow.action === 'update'"
                class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                <div class="rounded-lg bg-elevated p-3">
                  <div class="text-xs text-muted">
                    Залишок
                  </div>

                  <div class="mt-1 font-medium">
                    {{ previewRow.quantity.before }}
                    →
                    {{ previewRow.quantity.after }}
                  </div>

                  <div class="mt-1 text-xs text-muted">
                    + {{ previewRow.quantity.incoming }}
                  </div>
                </div>

                <div class="rounded-lg bg-elevated p-3">
                  <div class="text-xs text-muted">
                    Закупівельна ціна
                  </div>

                  <div class="mt-1 font-medium">
                    {{ formatPrice(previewRow.buyPrice.before) }}
                    →
                    {{ formatPrice(previewRow.buyPrice.after) }}
                    грн
                  </div>
                </div>

                <div class="rounded-lg bg-elevated p-3">
                  <div class="text-xs text-muted">
                    Продажна ціна
                  </div>

                  <div class="mt-1 font-medium">
                    {{ formatPrice(previewRow.sellPrice.after) }}
                    грн
                  </div>

                  <div class="mt-1 text-xs text-muted">
                    Не змінюється
                  </div>
                </div>
              </div>

              <div
                v-else-if="previewRow.action === 'create'"
                class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                <div class="rounded-lg bg-elevated p-3">
                  <div class="text-xs text-muted">
                    Кількість
                  </div>

                  <div class="mt-1 font-medium">
                    {{ previewRow.quantity.incoming }}
                  </div>
                </div>

                <div class="rounded-lg bg-elevated p-3">
                  <div class="text-xs text-muted">
                    Закупка
                  </div>

                  <div class="mt-1 font-medium">
                    {{ formatPrice(previewRow.buyPrice.after) }}
                    грн
                  </div>
                </div>

                <div class="rounded-lg bg-elevated p-3">
                  <div class="text-xs text-muted">
                    Продаж
                  </div>

                  <div class="mt-1 font-medium">
                    {{ formatPrice(previewRow.sellPrice.after) }}
                    грн
                  </div>
                </div>
              </div>

              <div
                v-if="previewRow.errors.length"
                class="mt-4 rounded-lg bg-error/10 p-3"
              >
                <div class="text-sm font-medium text-error">
                  Помилки
                </div>

                <div
                  v-for="errorMessage in previewRow.errors"
                  :key="errorMessage"
                  class="mt-1 text-sm text-error"
                >
                  • {{ errorMessage }}
                </div>
              </div>

              <div
                v-if="previewRow.warnings.length"
                class="mt-3 rounded-lg bg-warning/10 p-3"
              >
                <div class="text-sm font-medium text-warning">
                  Попередження
                </div>

                <div
                  v-for="warningMessage in previewRow.warnings"
                  :key="warningMessage"
                  class="mt-1 text-sm text-warning"
                >
                  • {{ warningMessage }}
                </div>
              </div>
            </div>

            <!-- REAL DATABASE IMPORT -->

            <div
              class="
                rounded-xl
                border
                border-primary/30
                bg-primary/5
                p-4
              "
            >
              <div
                class="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                <div>
                  <div
                    class="
                      flex
                      items-center
                      gap-2
                      font-semibold
                    "
                  >
                    <UIcon
                      name="i-lucide-database"
                      class="
                        size-5
                        text-primary
                      "
                    />

                    Запис приходу в базу
                  </div>

                  <div
                    class="
                      mt-1
                      text-sm
                      text-muted
                    "
                  >
                    Буде імпортовано
                    <strong>
                      {{ readyImportCount }}
                    </strong>
                    готових позицій.

                    <template
                      v-if="
                        importPreview.stats.blocked
                      "
                    >
                      {{ importPreview.stats.blocked }}
                      заблокованих позицій буде пропущено.
                    </template>
                  </div>

                  <div
                    class="
                      mt-1
                      text-xs
                      text-muted
                    "
                  >
                    При оновленні залишок збільшується на кількість приходу,
                    закупівельна ціна оновлюється, а продажна ціна зберігається.
                  </div>
                </div>

                <UButton
                  size="lg"
                  icon="i-lucide-database-zap"
                  :loading="commitLoading"
                  :disabled="
                    readyImportCount === 0 ||
                    importCompleted
                  "
                  @click="commitImport"
                >
                  {{
                    importCompleted
                      ? 'Прихід уже імпортовано'
                      : `Імпортувати ${readyImportCount} готові товари`
                  }}
                </UButton>
              </div>
            </div>

            <!-- COMMIT RESULT -->

            <div
              v-if="importCommit"
              class="
                rounded-xl
                border
                border-success/30
                bg-success/5
                p-4
              "
            >
              <div
                class="
                  flex
                  items-center
                  gap-2
                  font-semibold
                  text-success
                "
              >
                <UIcon
                  name="i-lucide-circle-check-big"
                  class="size-5"
                />

                Прихід успішно записано
              </div>

              <div
                class="
                  mt-3
                  grid
                  grid-cols-1
                  gap-2
                  sm:grid-cols-3
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
                    Створено
                  </div>

                  <div
                    class="
                      mt-1
                      text-lg
                      font-bold
                    "
                  >
                    {{ importCommit.stats.created }}
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
                    Оновлено
                  </div>

                  <div
                    class="
                      mt-1
                      text-lg
                      font-bold
                    "
                  >
                    {{ importCommit.stats.updated }}
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
                    Пропущено
                  </div>

                  <div
                    class="
                      mt-1
                      text-lg
                      font-bold
                    "
                  >
                    {{ importCommit.stats.skipped }}
                  </div>
                </div>
              </div>

              <div
                class="
                  mt-3
                  space-y-1
                "
              >
                <div
                  v-for="
                    commitRow
                    in importCommit.rows
                  "
                  :key="
                    `commit-${commitRow.rowNumber}`
                  "
                  class="
                    text-sm
                    text-muted
                  "
                >
                  <span
                    v-if="
                      commitRow.action ===
                      'created'
                    "
                    class="text-success"
                  >
                    ✓ Створено
                  </span>

                  <span
                    v-else-if="
                      commitRow.action ===
                      'updated'
                    "
                    class="text-primary"
                  >
                    ✓ Оновлено
                  </span>

                  <span
                    v-else
                    class="text-warning"
                  >
                    • Пропущено
                  </span>

                  —
                  {{ commitRow.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiSectionCard>

    </template>
  </div>
</template>
