import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid photo id'
    })
  }

  const body = await readBody(event)

  const photo = await prisma.storePhoto.update({
    where: {
      id
    },
    data: {
      title: body.title ?? null,
      description: body.description ?? null,
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: body.isActive !== false,
      imageUrl: body.imageUrl,
      publicId: body.publicId ?? null
    }
  })

  return photo
})