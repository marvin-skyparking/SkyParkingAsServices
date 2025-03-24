import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database';

interface PartnerRoleMappingAttributes {
  id: number;
  id_partner: number; // Ensure this is a number, not a string
  role_name: 'POST' | 'PAYMENT PARTNER';
  access_type: string;
  url_access: string;
  created_at?: Date;
  updated_at?: Date;
}

type PartnerRoleMappingCreationAttributes = Optional<
  PartnerRoleMappingAttributes,
  'id'
>;

class PartnerRoleMapping extends Model<
  PartnerRoleMappingAttributes,
  PartnerRoleMappingCreationAttributes
> {
  public id!: number;
  public id_partner!: number; // Ensure it's a number
  public role_name!: 'POST' | 'PAYMENT PARTNER';
  public access_type!: string;
  public url_access!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

PartnerRoleMapping.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    id_partner: {
      type: DataTypes.INTEGER.UNSIGNED, // Ensure it's an integer
      allowNull: false
    },
    role_name: {
      type: DataTypes.ENUM('POST', 'PAYMENT PARTNER'),
      allowNull: false
    },
    access_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    url_access: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'PartnerRoleMapping',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default PartnerRoleMapping;
