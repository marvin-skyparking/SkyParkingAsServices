import InquiryTransactionMapping from '../models/partner_mapping.model';

/**
 * Create a new InquiryTransactionMapping record.
 */
export async function createInquiryTransactionMapping(
  data: Partial<InquiryTransactionMapping>
) {
  return await InquiryTransactionMapping.create(data);
}

/**
 * Get an InquiryTransactionMapping by ID.
 */
export async function getInquiryTransactionMappingById(id: bigint) {
  return await InquiryTransactionMapping.findByPk(id);
}

/**
 * Get all InquiryTransactionMapping records.
 */
export async function getAllInquiryTransactionMappings() {
  return await InquiryTransactionMapping.findAll();
}

/**
 * Update an InquiryTransactionMapping by ID.
 */
export async function updateInquiryTransactionMapping(
  id: bigint,
  data: Partial<InquiryTransactionMapping>
) {
  const mapping = await InquiryTransactionMapping.findByPk(id);
  if (!mapping) throw new Error('Mapping record not found');

  return await mapping.update(data);
}

/**
 * Delete an InquiryTransactionMapping by ID.
 */
export async function deleteInquiryTransactionMapping(id: bigint) {
  const mapping = await InquiryTransactionMapping.findByPk(id);
  if (!mapping) throw new Error('Mapping record not found');

  await mapping.destroy();
  return { message: 'Mapping record deleted successfully' };
}

export async function findInquiryTransactionMapping(
  Login: string,
  Password: string,
  NMID: string
) {
  const mapping = await InquiryTransactionMapping.findOne({
    where: {
      Login: Login,
      Password: Password,
      NMID: NMID
    }
  });

  return mapping; // Returns the record if found, otherwise null
}

export async function findInquiryTransactionMappingPartner(
  login: string,
  password: string
) {
  const mapping = await InquiryTransactionMapping.findOne({
    where: {
      Login: login,
      Password: password
    }
  });

  return mapping; // Returns the record if found, otherwise null
}

export async function findLocationStoreCodeData(StoreCode: string) {
  const data_location = await InquiryTransactionMapping.findOne({
    where: {
      StoreCode: StoreCode
    }
  });

  return data_location; // Returns the record if found, otherwise null
}

export async function findInquiryTransactionMappingByNMID(NMID: string) {
  const mapping = await InquiryTransactionMapping.findOne({
    where: {
      NMID: NMID
    }
  });

  return mapping;
}
