import { Request, Response } from "express";
import {
  createContact,
  deleteContact,
  getContactById,
  listContacts,
  updateContact,
} from "../services/contactService";
import {
  assertAtLeastOneField,
  assertNonEmptyString,
  assertOptionalString,
} from "../utils/validation";
import { asyncHandler } from "../utils/asyncHandler";

export const createContactController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;

    assertNonEmptyString(body.workspaceId, "workspaceId");
    assertNonEmptyString(body.email, "email");

    const firstName = assertOptionalString(
      body.firstName,
      "firstName"
    );

    const lastName = assertOptionalString(
      body.lastName,
      "lastName"
    );

    const company = assertOptionalString(
      body.company,
      "company"
    );

    const title = assertOptionalString(
      body.title,
      "title"
    );

    const contact = await createContact({
      workspaceId: body.workspaceId,
      email: body.email,
      firstName,
      lastName,
      company,
      title,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  }
);

export const listContactsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId =
      typeof req.query.workspaceId === "string"
        ? req.query.workspaceId
        : undefined;

    const email =
      typeof req.query.email === "string"
        ? req.query.email
        : undefined;

    const contacts = await listContacts({
      workspaceId,
      email,
    });

    res.json({
      success: true,
      data: contacts,
    });
  }
);

export const getContactController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const contact = await getContactById(req.params.id);

    res.json({
      success: true,
      data: contact,
    });
  }
);

export const updateContactController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    const body = req.body as Record<string, unknown>;

    assertAtLeastOneField(body, [
      "email",
      "firstName",
      "lastName",
      "company",
      "title",
    ]);

    const email = assertOptionalString(body.email, "email");
    const firstName = assertOptionalString(
      body.firstName,
      "firstName"
    );
    const lastName = assertOptionalString(
      body.lastName,
      "lastName"
    );
    const company = assertOptionalString(
      body.company,
      "company"
    );
    const title = assertOptionalString(
      body.title,
      "title"
    );

    const contact = await updateContact(req.params.id, {
      email,
      firstName:
        body.firstName === null ? null : firstName,
      lastName:
        body.lastName === null ? null : lastName,
      company:
        body.company === null ? null : company,
      title:
        body.title === null ? null : title,
    });

    res.json({
      success: true,
      data: contact,
    });
  }
);

export const deleteContactController = asyncHandler(
  async (req: Request, res: Response) => {
    assertNonEmptyString(req.params.id, "id");

    await deleteContact(req.params.id);

    res.status(204).send();
  }
);