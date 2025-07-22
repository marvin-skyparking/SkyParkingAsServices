import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/database';

export interface VoucherRedemptionPOSTRequest {
  login: string;
  password: string;
  locationCode: string;
  transactionNo: string;
  transactionReferenceNo: string;
  voucherType: VoucherType;
  voucherValue: number;
  voucherExpiryDate: string;
  customerVehicleType: string;
  customerVehiclePlateNo: string;
  signature: string;
}

export interface VoucherRedemptionPOSTResponse {
  transactionNo: string;
  transactionReferenceNo: string;
  voucherType: VoucherType;
  voucherValue: number;
  voucherStatus: RedemptionStatus;
  gateInCode: string;
  inTime: string;
  duration: number;
  tariff: number;
}

export interface VoucherRedemptionMerchantRequest {
  login: string;
  password: string;
  merchantID: string;
  tenantID: string;
  locationCode: string;
  transactionNo: string;
  transactionReferenceNo: string;
  transactionReceiptNo: string;
  transactionReceiptAmount: number;
  voucherType: VoucherType;
  voucherValue: number;
  voucherExpiryDate: string;
  customerVehicleType: string;
  customerVehiclePlateNo: string;
  customerMobileNo: string;
  customerEmail: string;
  signature: string;
}

export interface VoucherRedemptionMerchantResponse {
  transactionNo: string;
  transactionReferenceNo: string;
  transactionReceiptNo: string;
  voucherType: VoucherType;
  voucherValue: number;
  voucherStatus: RedemptionStatus;
  gateInCode: string;
  inTime: string;
  duration: number;
  tariff: number;
}

export interface CreateVoucherRedemptionDto {
  CompanyName?: string;
  MerchantID?: string;
  TenantID?: string;
  LocationCode?: string;
  TransactionNo?: string;
  TransactionReferenceNo?: string;
  TransactionReceiptNo?: string;
  TransactionReceiptAmount?: number;
  VoucherType?: string;
  VoucherValue?: number;
  VoucherExpiryDate?: Date | undefined;
  CustomerVehicleType?: string;
  CustomerVehiclePlateNo?: string;
  CustomerMobileNo?: string;
  CustomerEmail?: string;
  MerchantDataRequest?: string;
  MerchantDataResponse?: string;
  POSTDataRequest?: string;
  POSTDataResponse?: string;
  CreatedBy?: string;
  CreatedOn?: Date | undefined;
  UpdatedBy?: string;
  UpdatedOn?: Date | undefined;
}

export enum VoucherType {
  AMOUNT = 'AMOUNT',
  DURATION = 'DURATION'
}

export enum RedemptionStatus {
  ISSUED = 'ISSUED',
  REDEEMED = 'REDEEMED'
}

interface VoucherRedemptionAttributes {
  Id: number;
  CompanyName?: string;
  MerchantID?: string;
  TenantID?: string;
  LocationCode?: string;
  TransactionNo?: string;
  TransactionReferenceNo?: string;
  TransactionReceiptNo?: string;
  TransactionReceiptAmount?: number;
  VoucherType?: string;
  VoucherValue?: number;
  VoucherExpiryDate?: Date;
  CustomerVehicleType?: string;
  CustomerVehiclePlateNo?: string;
  CustomerMobileNo?: string;
  CustomerEmail?: string;
  MerchantDataRequest?: string;
  MerchantDataResponse?: string;
  POSTDataRequest?: string;
  POSTDataResponse?: string;
  CreatedBy?: string;
  CreatedOn?: Date;
  UpdatedBy?: string;
  UpdatedOn?: Date;
}

type VoucherRedemptionCreationAttributes = Optional<
  VoucherRedemptionAttributes,
  'Id'
>;

export class VoucherRedemption
  extends Model<
    VoucherRedemptionAttributes,
    VoucherRedemptionCreationAttributes
  >
  implements VoucherRedemptionAttributes
{
  public Id!: number;
  public CompanyName?: string;
  public MerchantID?: string;
  public TenantID?: string;
  public LocationCode?: string;
  public TransactionNo?: string;
  public TransactionReferenceNo?: string;
  public TransactionReceiptNo?: string;
  public TransactionReceiptAmount?: number;
  public VoucherType?: string;
  public VoucherValue?: number;
  public VoucherExpiryDate?: Date;
  public CustomerVehicleType?: string;
  public CustomerVehiclePlateNo?: string;
  public CustomerMobileNo?: string;
  public CustomerEmail?: string;
  public MerchantDataRequest?: string;
  public MerchantDataResponse?: string;
  public POSTDataRequest?: string;
  public POSTDataResponse?: string;
  public CreatedBy?: string;
  public CreatedOn?: Date;
  public UpdatedBy?: string;
  public UpdatedOn?: Date;
}

VoucherRedemption.init(
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
      type: DataTypes.STRING(25),
      allowNull: true
    },
    TransactionReferenceNo: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    TransactionReceiptNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    TransactionReceiptAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    VoucherType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    VoucherValue: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    VoucherExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CustomerVehicleType: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CustomerVehiclePlateNo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CustomerMobileNo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CustomerEmail: {
      type: DataTypes.STRING(100),
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
    tableName: 'VoucherRedemption',
    sequelize,
    timestamps: false
  }
);
