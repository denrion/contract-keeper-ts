import Contact from '../models/Contact';
import * as factory from './handlerFactory';

// @desc      Get All Contacts
// @route     GET /api/v1/contacts
// @access    Private
export const getAllContacts = factory.getAll(Contact);

// @desc      Get One Contact
// @route     GET /api/v1/contacts/:contactId
// @access    Private
export const getContact = factory.getOne(Contact);

// @desc      Create New Contact
// @route     POST /api/v1/contacts
// @access    Private
export const createContact = factory.createOne(Contact);

// @desc      Update Contact
// @route     PATCH /api/v1/contacts/:contactId
// @access    Private
export const updateContact = factory.updateOne(Contact);

// @desc      Delete Contact
// @route     DELETE /api/v1/contacts/:contactId
// @access    Private
export const deleteContact = factory.deleteOne(Contact);
