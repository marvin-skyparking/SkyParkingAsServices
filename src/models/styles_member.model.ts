// models/StylesCheckMembership.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

export interface DecryptedAutoEntry {
  login: string;
  password: string;
  transactionNo: string;
  licensePlateNo: string;
  locationCode: string;
  signature: string;
}

interface StylesCheckMembershipAttributes {
  Id: number;
  CompanyName?: string;
  NMID?: string;
  LocationCode?: string;
  TransactionNo?: string;
  LicensePlateNo?: string;
  QRTicket?: string;
  ResponseCode?: string;
  ResponseStatus?: number;
  MerchantDataRequest?: string;
  MerchantDataResponse?: string;
  POSTDataRequest?: string;
  POSTDataResponse?: string;
  RecordStatus?: number;
  CreatedBy?: string;
  CreatedOn?: Date;
  UpdatedBy?: string;
  UpdatedOn?: Date;
}

type StylesCheckMembershipCreationAttributes = Optional<
  StylesCheckMembershipAttributes,
  'Id'
>;

class StylesCheckMembership
  extends Model<
    StylesCheckMembershipAttributes,
    StylesCheckMembershipCreationAttributes
  >
  implements StylesCheckMembershipAttributes
{
  public Id!: number;
  public CompanyName?: string;
  public NMID?: string;
  public LocationCode?: string;
  public TransactionNo?: string;
  public LicensePlateNo?: string;
  public QRTicket?: string;
  public ResponseCode?: string;
  public ResponseStatus?: number;
  public MerchantDataRequest?: string;
  public MerchantDataResponse?: string;
  public POSTDataRequest?: string;
  public POSTDataResponse?: string;
  public RecordStatus?: number;
  public CreatedBy?: string;
  public CreatedOn?: Date;
  public UpdatedBy?: string;
  public UpdatedOn?: Date;
}

StylesCheckMembership.init(
  {
    Id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    CompanyName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    NMID: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    LocationCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    TransactionNo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    LicensePlateNo: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    QRTicket: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    ResponseCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ResponseStatus: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    MerchantDataRequest: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    MerchantDataResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataRequest: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    POSTDataResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'StylesCheckMembership',
    timestamps: false
  }
);

export default StylesCheckMembership;
