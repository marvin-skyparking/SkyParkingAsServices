import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/database';

export interface MerchantUsageRequest {
  login: string;
  password: string;
  merchantID: string;
  locationCode: string;
  transactionNo: string;
  licensePlateNo: string;
  inTime: string;
  gateInCode: string;
  vehicleType: string;
  totalTariff: number;
  outTime: string;
  gateOutCode: string;
  signature: string;
}

export interface MerchantUsageResponse {
  transactionNo: string;
  licensePlateNo: string;
  transactionStatus: string;
}

export interface POSTUsageRequest {
  login: string;
  password: string;
  locationCode: string;
  transactionNo: string;
  licensePlateNo: string;
  inTime: string;
  gateInCode: string;
  vehicleType: string;
  totalTariff: number;
  outTime: string;
  gateOutCode: string;
  signature: string;
}

export interface POTUsageResponse {
  transactionNo: string;
  licensePlateNo: string;
  transactionStatus: string;
}

export interface VoucherUsageAttributes {
  Id?: number;
  CompanyName?: string;
  MerchantID?: string;
  LocationCode?: string;
  TransactionNo?: string;
  LicensePlateNo?: string;
  InTime?: Date;
  GateInCode?: string;
  VehicleType?: string;
  TotalTariff?: number;
  OutTime?: Date;
  GateOutCode?: string;
  MerchantDataRequest?: string;
  MerchantDataResponse?: string;
  POSTDataRequest?: string;
  POSTDataResponse?: string;
  CreatedBy?: string;
  CreatedOn?: Date;
  UpdatedBy?: string;
  UpdatedOn?: Date;
}

export interface VoucherUsageCreationAttributes
  extends Optional<VoucherUsageAttributes, 'Id'> {}

export class VoucherUsage
  extends Model<VoucherUsageAttributes, VoucherUsageCreationAttributes>
  implements VoucherUsageAttributes
{
  public Id!: number;
  public CompanyName?: string;
  public MerchantID?: string;
  public LocationCode?: string;
  public TransactionNo?: string;
  public LicensePlateNo?: string;
  public InTime?: Date;
  public GateInCode?: string;
  public VehicleType?: string;
  public TotalTariff?: number;
  public OutTime?: Date;
  public GateOutCode?: string;
  public MerchantDataRequest?: string;
  public MerchantDataResponse?: string;
  public POSTDataRequest?: string;
  public POSTDataResponse?: string;
  public CreatedBy?: string;
  public CreatedOn?: Date;
  public UpdatedBy?: string;
  public UpdatedOn?: Date;
}

VoucherUsage.init(
  {
    Id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    CompanyName: {
      type: DataTypes.STRING(200)
    },
    MerchantID: {
      type: DataTypes.STRING(20)
    },
    LocationCode: {
      type: DataTypes.STRING(20)
    },
    TransactionNo: {
      type: DataTypes.STRING(25)
    },
    LicensePlateNo: {
      type: DataTypes.STRING(25)
    },
    InTime: {
      type: DataTypes.DATE
    },
    GateInCode: {
      type: DataTypes.STRING(20)
    },
    VehicleType: {
      type: DataTypes.STRING(20)
    },
    TotalTariff: {
      type: DataTypes.DECIMAL(18, 2)
    },
    OutTime: {
      type: DataTypes.DATE
    },
    GateOutCode: {
      type: DataTypes.STRING(20)
    },
    MerchantDataRequest: {
      type: DataTypes.TEXT
    },
    MerchantDataResponse: {
      type: DataTypes.TEXT
    },
    POSTDataRequest: {
      type: DataTypes.TEXT
    },
    POSTDataResponse: {
      type: DataTypes.TEXT
    },
    CreatedBy: {
      type: DataTypes.STRING(50)
    },
    CreatedOn: {
      type: DataTypes.DATE
    },
    UpdatedBy: {
      type: DataTypes.STRING(50)
    },
    UpdatedOn: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    tableName: 'VoucherUsage',
    timestamps: true
  }
);
