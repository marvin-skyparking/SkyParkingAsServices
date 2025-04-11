import { Request, Response } from 'express';
import {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner
} from '../services/partner.service';

/**
 * Create a new partner
 */
export async function createPartnerController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { nama_partner } = req.body;
    if (!nama_partner) {
      return res.status(400).json({ message: 'nama_partner is required' });
    }

    const partner = await createPartner({ nama_partner });
    return res.status(201).json(partner);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Get all partners
 */
export async function getAllPartnersController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const partners = await getAllPartners();
    return res.status(200).json(partners);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Get a single partner by ID
 */
export async function getPartnerByIdController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { id } = req.params;
    const partner = await getPartnerById(id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    return res.status(200).json(partner);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Update a partner (only allows updating nama_partner or last_login)
 */
export async function updatePartnerController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { id } = req.params;
    const { nama_partner, last_login } = req.body;

    const updatedPartner = await updatePartner(id, {
      nama_partner,
      last_login
    });
    return res.status(200).json(updatedPartner);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Delete a partner by ID
 */
export async function deletePartnerController(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { id } = req.params;
    await deletePartner(id);
    return res.status(200).json({ message: 'Partner deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
