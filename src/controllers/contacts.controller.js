const contactsService = require('../services/contacts.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function createContact(req, res, next) {
  if (!req.body?.name || typeof req.body.name !== 'string') {
    return next(new ApiError(400, 'Name should be a non-empty string'));
  }

  try {
    const contact = await contactsService.createContact({
      ...req.body,
      avatar: req.file ? `/public/uploads/${req.file.filename}` : null,
    });

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${contact.id}`,
      })
      .json(
        JSend.success({
          contact,
        })
      );
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, 'An error occurred while creating the contact')
    );
  }
}

async function getContactsByFilter(req, res, next) {
  let result = {
    contacts: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await contactsService.getManyContacts(req.query);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, 'An error occurred while retrieving contacts'));
  }

  return res.json(JSend.success({ contacts: result.contacts, metadata: result.metadata }));
}

function getContact(req, res) {
  return res.json(JSend.success({ contact: {} }));
}

function updateContact(req, res) {
  return res.json(JSend.success({ contact: {} }));
}

function deleteContact(req, res) {
  return res.json(JSend.success());
}

function deleteAllContacts(req, res) {
  return res.json(JSend.success());
}

module.exports = {
  getContactsByFilter,
  deleteAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};