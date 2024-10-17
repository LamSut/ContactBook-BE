const knex = require('../database/knex');
const Paginator = require('./paginator');
const { unlink } = require('node:fs');

function contactRepository() {
  return knex('contacts');
}

function readContact(payload) {
  return {
    name: payload.name,
    email: payload.email,
    address: payload.address,
    phone: payload.phone,
    favorite: payload.favorite,
    avatar: payload.avatar,
  };
}

// Define functions for accessing the database

async function createContact(payload) {
  const contact = readContact(payload);
  const [id] = await contactRepository().insert(contact);
  return { id, ...contact };
}

async function getManyContacts(query) {
  const { name, favorite, page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);

  let results = await contactRepository()
    .where((builder) => {
      if (name) {
        builder.where('name', 'like', `%${name}%`);
      }

      if (favorite !== undefined && favorite !== '0' && favorite !== 'false') {
        builder.where('favorite', 1);
      }
    })
    .select(
      knex.raw('count(*) OVER() AS recordCount'),
      'id',
      'name',
      'email',
      'address',
      'phone',
      'favorite',
      'avatar'
    )
    .limit(paginator.limit)
    .offset(paginator.offset);

  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    metadata: paginator.getMetadata(totalRecords),
    contacts: results,
  };
}

async function getContactById(id) {
  return contactRepository().where('id', id).select('*').first();
}

async function updateContact(id, payload) {
  const updatedContact = await contactRepository()
    .where('id', id)
    .select('*')
    .first();

  if (!updatedContact) {
    return null;
  }

  const update = readContact(payload);
  if (!update.avatar) {
    delete update.avatar;
  }

  await contactRepository().where('id', id).update(update);

  if (
    update.avatar &&
    updatedContact.avatar &&
    update.avatar !== updatedContact.avatar &&
    updatedContact.avatar.startsWith('/public/uploads')
  ) {
    unlink(`.${updatedContact.avatar}`, (err) => { });
  }

  return { ...updatedContact, ...update };
}

async function deleteContact(id) {
  const deletedContact = await contactRepository()
    .where('id', id)
    .select('avatar')
    .first();

  if (!deletedContact) {
    return null;
  }

  await contactRepository().where('id', id).del();

  if (
    deletedContact.avatar &&
    deletedContact.avatar.startsWith('/public/uploads')
  ) {
    unlink(deletedContact.avatar, (err) => { });
  }

  return deletedContact;
}

async function deleteAllContacts() {
  const contacts = await contactRepository().select('avatar');

  await contactRepository().del();

  contacts.forEach((contact) => {
    if (contact.avatar && contact.avatar.startsWith('/public/uploads')) {
      unlink(contact.avatar, (err) => { });
    }
  });
}

module.exports = {
  createContact,
  getManyContacts,
  getContactById,
  updateContact,
  deleteContact,
  deleteAllContacts
};