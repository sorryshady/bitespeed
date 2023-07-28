const {
  createContact,
  linkSecondaryContacts,
  findContactsByEmailOrPhone,
  findEmailsByPhoneNumber,
  findPhoneNumbersByEmail, 
  findSecondaryIdsByPrimaryId, 
  updateContact
} = require('../services/identify.service');

const identifyCustomer = async (req, res) => {
  const { email, phoneNumber } = req.body;
  
  try {
    // Step 1: Find contacts with either email or phoneNumber and precedence = 'primary'
    const contacts = await findContactsByEmailOrPhone(email, phoneNumber);
    // Step 2: Check if any primary contact exists
    const primaryContact = contacts.filter(
      (contact) => contact.linkPrecedence === 'primary'
    );

    // If no primary contact found, create a new primary contact
    if (primaryContact.length === 0) {
      const newContact = await createContact(email, phoneNumber, 'primary');
      return res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: null, // Set to null when no secondary contacts
        },
      });
    }
    
    // If one primary contact found, check if the email and phoneNumber are already present in any primary contact
    const duplicateContact = contacts.find(
      (contact) =>
        contact.email === email && contact.phoneNumber === phoneNumber
    );

    if (duplicateContact) {
      // If a contact with the same email and phoneNumber exists, prepare the response without creating a new contact
      const secondaryContactIds = await findSecondaryIdsByPrimaryId(primaryContact.id);
      const emailSet = new Set([...(await findEmailsByPhoneNumber(primaryContact.phoneNumber)), primaryContact.email].filter(Boolean));
      const phoneNumberSet = new Set([...(await findPhoneNumbersByEmail(primaryContact.email)), primaryContact.phoneNumber].filter(Boolean));

      return res.json({
        contact: {
          primaryContactId: primaryContact.id,
          emails: [...emailSet],
          phoneNumbers: [...phoneNumberSet],
          secondaryContactIds: secondaryContactIds.length > 0 ? secondaryContactIds : null, // Set to null if no secondary contacts
        },
      });
    }
   // If one primary contact found, create a new secondary contact and link it
   if (contacts.length === 1 && contacts[0].linkPrecedence === 'primary') {
    const primaryContact = contacts[0];

    // Create a new secondary contact
    const newSecondaryContact = await createContact(email, phoneNumber, 'secondary');

    // Link the new secondary contact to the existing primary contact
    await linkSecondaryContacts(primaryContact.id, [newSecondaryContact]);

    // Find all secondary contact IDs connected to the primary contact
    const secondaryContactIds = await findSecondaryIdsByPrimaryId(primaryContact.id);

    // Prepare the response object
    const emailSet = new Set([...(await findEmailsByPhoneNumber(primaryContact.phoneNumber)), primaryContact.email].filter(Boolean));
    const phoneNumberSet = new Set([...(await findPhoneNumbersByEmail(primaryContact.email)), primaryContact.phoneNumber].filter(Boolean));

    return res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: [...emailSet],
        phoneNumbers: [...phoneNumberSet],
        secondaryContactIds: secondaryContactIds.length > 0 ? secondaryContactIds : null, // Set to null if no secondary contacts
      },
    });
  }
    // Step 3: Handle the case where more than one primary contact is found
    if(primaryContact.length === 2){
      console.log('third case');
      const [olderPrimaryContact, youngerPrimaryContact] = primaryContact.sort(
        (a, b) => a.createdAt - b.createdAt
      );
      // Update the younger primary contact to become a secondary contact
      youngerPrimaryContact.linkPrecedence = 'secondary';
      youngerPrimaryContact.linkedId = olderPrimaryContact.id;
      await updateContact(youngerPrimaryContact);
       // Prepare the response
      const primary = primaryContact[0]; // Use the first primary contact
      const secondary = primaryContact[1];
      const secondaryContactIds = await findSecondaryIdsByPrimaryId(primary.id);

      const emailSet = new Set([...(await findEmailsByPhoneNumber(secondary.phoneNumber)), primary.email].filter(Boolean));
      const phoneNumberSet = new Set([...(await findPhoneNumbersByEmail(primary.email)), secondary.phoneNumber].filter(Boolean));

      return res.json({
        contact: {
          primaryContactId: primary.id,
          emails: [...emailSet],
          phoneNumbers: [...phoneNumberSet],
          secondaryContactIds: secondaryContactIds.length > 0 ? secondaryContactIds : null, // Set to null if no secondary contacts
        },
      });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = { identifyCustomer };
