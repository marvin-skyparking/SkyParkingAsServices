import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface PartnerMappingAttributes {
  Id: number;
  CompanyName?: string;
  MPAN?: string;
  NMID?: string;
  StoreCode?: string;
  Login?: string;
  Password?: string;
  Password_hash?: string;
  SecretKey?: string;
  URL_RequestInquiryTransaction?: string;
  ProjectCategoryId?: number;
  GibberishKey?: string;
  RecordStatus?: number;
  CreatedBy?: string;
  CreatedDate?: Date;
  UpdatedBy?: string;
  UpdatedDate?: Date;
}

// Define optional attributes
type PartnerMappingCreationAttributes = Optional<
  PartnerMappingAttributes,
  'Id'
>;

class PartnerMapping
  extends Model<PartnerMappingAttributes, PartnerMappingCreationAttributes>
  implements PartnerMappingAttributes
{
  public Id!: number;
  public CompanyName?: string;
  public MPAN?: string;
  public NMID?: string;
  public StoreCode?: string;
  public Login?: string;
  public Password?: string;
  public Password_hash?: string | undefined;
  public SecretKey?: string;
  public URL_RequestInquiryTransaction?: string;
  public ProjectCategoryId?: number;
  public GibberishKey?: string;
  public RecordStatus?: number;
  public CreatedBy?: string;
  public CreatedDate?: Date;
  public UpdatedBy?: string;
  public UpdatedDate?: Date;
}

PartnerMapping.init(
  {
    Id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    CompanyName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    MPAN: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    NMID: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    StoreCode: {
      type: DataTypes.STRING(15),
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
    Password_hash: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    SecretKey: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    URL_RequestInquiryTransaction: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ProjectCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    GibberishKey: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RecordStatus: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    CreatedBy: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    UpdatedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'PartnerMapping',
    timestamps: false
  }
);

export default PartnerMapping;
