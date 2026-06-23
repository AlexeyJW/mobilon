import ExcelJS from 'exceljs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {

  const purchases = await prisma.purchaseItem.findMany({
    where: {
      status: 'pending'
    },
    orderBy: {
      supplier: 'asc'
    }
  })

  const workbook = new ExcelJS.Workbook()

  const worksheet = workbook.addWorksheet('Закупівля')

  worksheet.columns = [
    {
      header: 'Назва',
      key: 'name',
      width: 40
    },
    {
      header: 'Кількість',
      key: 'quantity',
      width: 15
    },
    {
      header: 'Постачальник',
      key: 'supplier',
      width: 30
    },
    {
      header: 'Примітка',
      key: 'note',
      width: 50
    }
  ]

  purchases.forEach(item => {
    worksheet.addRow({
      name: item.name,
      quantity: item.quantity,
      supplier: item.supplier,
      note: item.note
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()

  setHeader(
    event,
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )

  setHeader(
    event,
    'Content-Disposition',
    'attachment; filename="purchase-list.xlsx"'
  )

  return buffer
})