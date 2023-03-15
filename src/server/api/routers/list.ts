import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ulid } from "ulidx";

export const listRouter = createTRPCRouter({
  getListsByUserId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.id}`,
      };
    }),
  createList: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        title: z.string(),
        description: z.string(),
        items: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      const res = await prisma.list.create({
        data: {
          id: ulid(),
          owner: input.owner,
          title: input.title,
          description: input.description,
          items: {
            create: input.items.map((item) => ({
              id: ulid(),
              text: item,
            })),
          },
        },
      });

      return res;
    }),
  updateList: publicProcedure
    .input(
      z.object({
        id: z.string(),
        owner: z.string(),
        title: z.string(),
        description: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      // given a list of items, update the items that exist, create the items that don't exist, and delete the items that don't exist

      const res = await prisma.list.update({
        where: {
          id: input.id,
        },
        data: {
          owner: input.owner,
          title: input.title,
          description: input.description,
          items: {
            upsert: input.items.map((item) => ({
              where: {
                id: item.id,
              },
              create: {
                id: item.id,
                text: item.text,
              },
              update: {
                text: item.text,
              },
            })),
            deleteMany: {
              id: {
                notIn: input.items.map((item) => item.id),
              },
            },
          },
        },
      });

      return res;
    }),
  getListById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { prisma } = ctx;

      const res = await prisma.list.findUnique({
        where: {
          id: input.id,
        },
        include: {
          items: true,
        },
      });

      if (!res) {
        throw new Error("List not found");
      }

      return res;
    }),
});
