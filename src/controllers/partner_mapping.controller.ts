import { Request, Response } from 'express';
import * as PartnerRoleMappingService from '../services/partner_mapping.service';

export async function createRole(req: Request, res: Response): Promise<any> {
  try {
    const { id_partner, role_name, access_type, url_access } = req.body;

    if (!id_partner || !role_name || !access_type || !url_access) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newRole = await PartnerRoleMappingService.createRole({
      id_partner: Number(id_partner), // Ensure it's a number
      role_name,
      access_type,
      url_access
    });

    return res.status(201).json(newRole);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getRoles(req: Request, res: Response): Promise<any> {
  try {
    const roles = await PartnerRoleMappingService.getAllRoles();
    return res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getRoleById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const role = await PartnerRoleMappingService.getRoleById(Number(id));

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json(role);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateRole(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const updatedRole = await PartnerRoleMappingService.updateRole(
      Number(id),
      req.body
    );

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json(updatedRole);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteRole(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const deleted = await PartnerRoleMappingService.deleteRole(Number(id));

    if (!deleted) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
