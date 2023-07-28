const Contact = require('../models/contact.model');
let contactIdCounter = 1; // Initialize a counter for contact IDs

const createContact = async (email, phoneNumber, linkPrecedence) => {
  const newContact = new Contact({
    id: contactIdCounter++, // Manually assign and increment the contact ID
    email,
    phoneNumber,
    linkPrecedence,
  });
  return newContact.save();
};


const linkSecondaryContacts = async (primaryContactId, secondaryContacts) => {
    try {
      const primaryContact = await Contact.findOne({ id: primaryContactId });
      if (!primaryContact) {
        throw new Error('Primary contact not found');
      }
  
      for (const secondaryContact of secondaryContacts) {
        secondaryContact.linkedId = primaryContactId;
        secondaryContact.updatedAt = new Date();
        await secondaryContact.save();
      }
    } catch (error) {
      throw new Error(`Error linking secondary contacts: ${error.message}`);
    }
  };


const findContactsByEmailOrPhone = async (email, phoneNumber) => {
  return Contact.find({
    $or: [
      { email: { $eq: email }, linkPrecedence: 'primary' },
      { phoneNumber: { $eq: phoneNumber }, linkPrecedence: 'primary' }
    ],
  });
};


const findEmailsByPhoneNumber = async (phoneNumber) => {
    const contacts = await Contact.find({ phoneNumber });
    return contacts.map((contact) => contact.email).filter(Boolean);
  };
  
  const findPhoneNumbersByEmail = async (email) => {
    const contacts = await Contact.find({ email });
    return contacts.map((contact) => contact.phoneNumber).filter(Boolean);
  };
  
  const findSecondaryIdsByPrimaryId = async (primaryContactId) => {
    const contacts = await Contact.find({ linkedId: primaryContactId });
    return contacts.map((contact) => contact.id);
  };

  const updateContact = async (contact) => {
    contact.updatedAt = new Date();
    return contact.save();
  };

module.exports = {
  createContact,
  linkSecondaryContacts,
  findContactsByEmailOrPhone,
  findEmailsByPhoneNumber,
  findPhoneNumbersByEmail,
  findSecondaryIdsByPrimaryId,
  updateContact
};
