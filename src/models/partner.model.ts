import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

interface PartnerAttributes {
  id: string;
  nama_partner: string;
  client_id: string;
  secret_key: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date | null;
}

type PartnerCreationAttributes = Optional<
  PartnerAttributes,
  'id' | 'created_at' | 'updated_at' | 'last_login'
>;

class Partner
  extends Model<PartnerAttributes, PartnerCreationAttributes>
  implements PartnerAttributes
{
  public id!: string;
  public nama_partner!: string;
  public client_id!: string;
  public secret_key!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public last_login!: Date | null;
}

Partner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nama_partner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    secret_key: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'partner',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Partner;
