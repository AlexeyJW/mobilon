import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'imageUrl is required'
    })
  }

  const photo = await prisma.storePhoto.create({
    data: {
      imageUrl: body.imageUrl,
      publicId: body.publicId ?? null,
      title: body.title ?? null,
      description: body.description ?? null,
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: body.isActive !== false
    }
  })

  return photo
})