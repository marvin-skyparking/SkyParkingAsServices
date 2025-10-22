import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust path as needed

export interface VoucherInquiryTicketAttributes {
  Id: number;
  CompanyName?: string | null;
  MerchantID?: string | null;
  TenantID?: string | null;
  LocationCode?: string | null;
  TransactionNo?: string | null;
  MerchantDataRequest?: string | null;
  MerchantDataResponse?: string | null;
  POSTDataRequest?: string | null;
  POSTDataResponse?: string | null;
  CreatedBy?: string | null;
  CreatedOn?: Date | null;
  UpdatedBy?: string | null;
  UpdatedOn?: Date | null;
}

// For creating new rows (Id auto increments)
export type VoucherInquiryTicketCreationAttributes = Optional<
  VoucherInquiryTicketAttributes,
  'Id'
>;

export class VoucherInquiryTicket
  extends Model<
    VoucherInquiryTicketAttributes,
    VoucherInquiryTicketCreationAttributes
  >
  implements VoucherInquiryTicketAttributes
{
  public Id!: number;
  public CompanyName!: string | null;
  public MerchantID!: string | null;
  public TenantID!: string | null;
  public LocationCode!: string | null;
  public TransactionNo!: string | null;
  public MerchantDataRequest!: string | null;
  public MerchantDataResponse!: string | null;
  public POSTDataRequest!: string | null;
  public POSTDataResponse!: string | null;
  public CreatedBy!: string | null;
  public CreatedOn!: Date | null;
  public UpdatedBy!: string | null;
  public UpdatedOn!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VoucherInquiryTicket.init(
  {
    Id: {
      type: DataTypes.BIGINT,
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
    TenantID: {
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
    tableName: 'VoucherInquiryTicket',
    timestamps: false, // since your table uses CreatedOn/UpdatedOn manually
    underscored: false
  }
);

export default VoucherInquiryTicket;
