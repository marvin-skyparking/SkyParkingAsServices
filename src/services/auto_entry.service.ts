import StylesCheckMembership from '../models/styles_member.model';
import { Op } from 'sequelize';

// CREATE
export async function createStylesCheckMembership(
  data: Partial<typeof StylesCheckMembership.prototype>
) {
  return await StylesCheckMembership.create({
    ...data,
    CreatedOn: new Date()
  });
}

// READ - By TransactionNo
export async function findByTransactionNo(transactionNo: string) {
  return await StylesCheckMembership.findOne({
    where: { TransactionNo: transactionNo }
  });
}

// READ - By LicensePlateNo (not empty)
export async function findAllWithRFID() {
  return await StylesCheckMembership.findAll({
    where: {
      LicensePlateNo: {
        [Op.ne]: ''
      }
    }
  });
}

// UPDATE - By ID
export async function updateStylesCheckMembershipById(
  id: number,
  updateData: Partial<typeof StylesCheckMembership.prototype>
) {
  return await StylesCheckMembership.update(
    {
      ...updateData,
      UpdatedOn: new Date()
    },
    {
      where: { Id: id }
    }
  );
}

// DELETE - By ID
export async function deleteStylesCheckMembershipById(id: number) {
  return await StylesCheckMembership.destroy({
    where: { Id: id }
  });
}
