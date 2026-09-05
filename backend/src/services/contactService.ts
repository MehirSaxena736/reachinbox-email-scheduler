import { prisma } from "../lib/prisma";
import {
  ContactListFilters,
  CreateContactInput,
  UpdateContactInput,
} from "../types/contact";
import { AppError } from "../utils/AppError";

export async function createContact(input: CreateContactInput) {
  const existing = await prisma.contact.findFirst({
    where: {
      workspaceId: input.workspaceId,
      email: input.email.toLowerCase().trim(),
    },
  });

  if (existing) {
    throw new AppError(409, "Contact with this email already exists", {
      code: "CONTACT_ALREADY_EXISTS",
    });
  }

  return prisma.contact.create({
    data: {
      workspaceId: input.workspaceId,
      email: input.email.toLowerCase().trim(),
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      company: input.company?.trim(),
      title: input.title?.trim(),
    },
  });
}

export async function listContacts(filters: ContactListFilters) {
  return prisma.contact.findMany({
    where: {
      workspaceId: filters.workspaceId,
      email: filters.email
        ? {
            contains: filters.email,
            mode: "insensitive",
          }
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getContactById(id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new AppError(404, "Contact not found", {
      code: "CONTACT_NOT_FOUND",
    });
  }

  return contact;
}

export async function updateContact(
  id: string,
  input: UpdateContactInput
) {
  const existing = await prisma.contact.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Contact not found", {
      code: "CONTACT_NOT_FOUND",
    });
  }

  if (input.email) {
    const duplicate = await prisma.contact.findFirst({
      where: {
        workspaceId: existing.workspaceId,
        email: input.email.toLowerCase().trim(),
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      throw new AppError(409, "Contact with this email already exists", {
        code: "CONTACT_ALREADY_EXISTS",
      });
    }
  }

  return prisma.contact.update({
    where: { id },
    data: {
      email: input.email?.toLowerCase().trim(),
      firstName:
        input.firstName === null
          ? null
          : input.firstName?.trim(),
      lastName:
        input.lastName === null
          ? null
          : input.lastName?.trim(),
      company:
        input.company === null
          ? null
          : input.company?.trim(),
      title:
        input.title === null
          ? null
          : input.title?.trim(),
    },
  });
}

export async function deleteContact(id: string) {
  const existing = await prisma.contact.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Contact not found", {
      code: "CONTACT_NOT_FOUND",
    });
  }

  await prisma.contact.delete({
    where: { id },
  });
}