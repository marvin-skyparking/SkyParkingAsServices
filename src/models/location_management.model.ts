// models/LocationManagement.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database';

interface LocationManagementAttributes {
  id: string;
  NMID: string;
  location_code: string;
  location_name: string;
  login?: string;
  password?: string;
  secret_key?: string;
  partner_key?: string;
  url_inquiry?: string;
  url_payment?: string;
  vendor_name: string;
  created_at?: Date;
  updated_at?: Date;
}

type LocationManagementCreationAttributes = Optional<
  LocationManagementAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export class LocationManagement
  extends Model<
    LocationManagementAttributes,
    LocationManagementCreationAttributes
  >
  implements LocationManagementAttributes
{
  public id!: string;
  public NMID!: string;
  public location_code!: string;
  public location_name!: string;
  public login?: string;
  public password?: string;
  public secret_key?: string;
  public partner_key?: string;
  public url_inquiry?: string;
  public url_payment?: string;
  public vendor_name!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

LocationManagement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    NMID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    login: DataTypes.STRING,
    password: DataTypes.STRING,
    secret_key: DataTypes.STRING,
    partner_key: DataTypes.STRING,
    url_inquiry: DataTypes.STRING,
    url_payment: DataTypes.STRING,
    vendor_name: {
      type: DataTypes.STRING,
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
    tableName: 'location_management',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
