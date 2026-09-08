import {
  defineEventHandler,
  readMultipartFormData,
  createError
} from 'h3'





import { parseInvoiceExcel } from '../../../utils/import/parseInvoiceExcel'

export default defineEventHandler(
  async event => {
    const parts =
      await readMultipartFormData(event)

    if (!parts?.length) {
      throw createError({
        statusCode: 400,
        message:
          'Файл не отримано'
      })
    }

    const file =
      parts.find(
        part =>
          part.name === 'file'
      )

    if (
      !file ||
      !file.data
    ) {
      throw createError({
        statusCode: 400,
        message:
          'Excel файл не отримано'
      })
    }

    const filename =
      file.filename || 'invoice.xlsx'

    const extension =
      filename
        .split('.')
        .pop()
        ?.toLowerCase()

    if (
      ![
        'xlsx',
        'xls'
      ].includes(
        extension || ''
      )
    ) {
      throw createError({
        statusCode: 400,
        message:
          'Підтримуються тільки файли .xlsx та .xls'
      })
    }

    /*
      На першому етапі обмежимо
      розмір накладної 10 МБ.
    */

    if (
      file.data.length >
      10 * 1024 * 1024
    ) {
      throw createError({
        statusCode: 413,
        message:
          'Файл завеликий. Максимум 10 МБ'
      })
    }

    try {
      const result =
        parseInvoiceExcel(
          file.data
        )

      return {
        fileName: filename,
        ...result
      }
    }
    catch (error: any) {
      console.error(
        'EXCEL IMPORT ERROR:',
        error
      )

      throw createError({
        statusCode: 400,
        message:
          error?.message ||
          'Не вдалося прочитати Excel файл'
      })
    }
  }
)