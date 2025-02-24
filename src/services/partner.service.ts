import { v4 as uuidv4 } from 'uuid';
import Partner from '../models/partner.model';

/**
 * Create a new partner with auto-generated UUIDs
 */
export async function createPartner(data: { nama_partner: string }) {
  return await Partner.create({
    id: uuidv4(), // Auto-generate UUID
    nama_partner: data.nama_partner,
    client_id: uuidv4(), // Auto-generate UUID
    secret_key: uuidv4(), // Auto-generate UUID
    created_at: new Date(),
    updated_at: new Date()
  });
}

/**
 * Get all partners
 */
export async function getAllPartners() {
  return await Partner.findAll();
}

/**
 * Get a partner by ID
 */
export async function getPartnerById(id: string) {
  return await Partner.findByPk(id);
}

/**
 * Update partner (allows updating only nama_partner and last_login)
 */
export async function updatePartner(
  id: string,
  data: Partial<{ nama_partner: string; last_login: Date }>
) {
  const partner = await Partner.findByPk(id);
  if (!partner) throw new Error('Partner not found');

  return await partner.update({
    ...data,
    updated_at: new Date() // Auto-update timestamp
  });
}

/**
 * Delete a partner by ID
 */
export async function deletePartner(id: string) {
  const partner = await Partner.findByPk(id);
  if (!partner) throw new Error('Partner not found');

  await partner.destroy();
  return { message: 'Partner deleted successfully' };
}

/**
 * Fetch the secret_key from the database using client_id
 */
export async function getSecretKeyByClientId(
  client_id: string
): Promise<string | null> {
  try {
    const partner = await Partner.findOne({ where: { client_id } });

    if (!partner) {
      return null;
    }

    return partner.secret_key; // Assuming the 'secret_key' column exists in the Partner model
  } catch (error) {
    console.error('Error fetching secret key:', error);
    return null;
  }
}
