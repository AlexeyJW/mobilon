import prisma from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
    const id = Number(event.context.params?.id);
    const body = await readBody(event);
    const purchase = await prisma.purchaseItem.update({
        where: { id },
        data: {
            status: body.status
        }
    })
    return purchase;
})