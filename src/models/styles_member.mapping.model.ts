// models/StylesCheckMembershipMapping.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface StylesCheckMembershipMappingAttributes {
  Id: number;
  CompanyName?: string;
  MerchantID?: string;
  NMID?: string;
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

type StylesCheckMembershipMappingCreationAttributes = Optional<
  StylesCheckMembershipMappingAttributes,
  'Id'
>;

class StylesCheckMembershipMapping
  extends Model<
    StylesCheckMembershipMappingAttributes,
    StylesCheckMembershipMappingCreationAttributes
  >
  implements StylesCheckMembershipMappingAttributes
{
  public Id!: number;
  public CompanyName?: string;
  public MerchantID?: string;
  public NMID?: string;
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

StylesCheckMembershipMapping.init(
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    CompanyName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    MerchantID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    NMID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    LocationCode: {
      type: DataTypes.STRING(50),
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
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'StylesCheckMembershipMapping',
    timestamps: false
  }
);

export default StylesCheckMembershipMapping;
