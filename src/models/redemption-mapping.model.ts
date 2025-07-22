import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/database';

export interface VoucherRedemptionMappingAttributes {
  Id: number;
  CompanyName?: string;
  MerchantID?: string;
  LocationCode?: string;
  Login?: string;
  Password?: string;
  SecretKey?: string;
  PartnerKey?: string;
  ApiUrl?: string;
  POST?: string;
  RecordStatus?: number;
  CreatedBy?: string;
  CreatedOn?: Date;
  UpdatedBy?: string;
  UpdatedOn?: Date;
}

export interface VoucherRedemptionMappingCreationAttributes
  extends Optional<VoucherRedemptionMappingAttributes, 'Id'> {}

export class VoucherRedemptionMapping
  extends Model<
    VoucherRedemptionMappingAttributes,
    VoucherRedemptionMappingCreationAttributes
  >
  implements VoucherRedemptionMappingAttributes
{
  public Id!: number;
  public CompanyName?: string;
  public MerchantID?: string;
  public LocationCode?: string;
  public Login?: string;
  public Password?: string;
  public SecretKey?: string;
  public PartnerKey?: string;
  public ApiUrl?: string;
  public POST?: string;
  public RecordStatus?: number;
  public CreatedBy?: string;
  public CreatedOn?: Date;
  public UpdatedBy?: string;
  public UpdatedOn?: Date;
}

VoucherRedemptionMapping.init(
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    CompanyName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    MerchantID: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    LocationCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Login: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Password: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    SecretKey: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PartnerKey: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ApiUrl: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    POST: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'VoucherRedemptionMapping',
    timestamps: true
  }
);
