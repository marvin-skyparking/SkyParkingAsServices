import PartnerRoleMapping from '../models/partner_role_mapping.model';

export async function getAllRoles() {
  return await PartnerRoleMapping.findAll();
}

export async function getRoleById(id: number) {
  return await PartnerRoleMapping.findByPk(id);
}

export async function getRolesByPartnerId(id_partner: number) {
  try {
    const roles = await PartnerRoleMapping.findAll({
      where: { id_partner },
      attributes: ['id', 'id_partner', 'role_name', 'access_type', 'url_access'] // Select relevant fields
    });

    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Database query failed');
  }
}

export async function createRole(data: {
  id_partner: number;
  role_name: 'POST' | 'PAYMENT PARTNER';
  access_type: string;
  url_access: string;
}) {
  return await PartnerRoleMapping.create(data);
}

export async function updateRole(
  id: number,
  data: Partial<{
    id_partner: number;
    role_name: 'POST' | 'PAYMENT PARTNER';
    access_type: string;
    url_access: string;
  }>
) {
  const role = await PartnerRoleMapping.findByPk(id);
  if (!role) throw new Error('Role not found');
  return await role.update(data);
}

export async function deleteRole(id: number) {
  const role = await PartnerRoleMapping.findByPk(id);
  if (!role) throw new Error('Role not found');
  await role.destroy();
  return { message: 'Role deleted successfully' };
}
