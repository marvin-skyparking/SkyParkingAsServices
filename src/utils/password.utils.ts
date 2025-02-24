import bcrypt from 'bcrypt';
import loggerUtils from './logger.utils';

const saltRounds = 10;

export async function Hash(password: any) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error: any) {
    throw new Error('Error hashing password');
  }
}

export async function Compare(
  password: string,
  hashedPassword: any
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    loggerUtils.error(error, 'error comparing password');
    return false;
  }
}

export async function Asterisks(password: string): Promise<string> {
  return '*'.repeat(password.length / 4);
}

export default {
  Hash: Hash,
  Compare: Compare,
  Asterisks: Asterisks
};
