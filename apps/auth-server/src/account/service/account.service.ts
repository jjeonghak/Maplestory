import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Account, AccountDocument } from "../schema/account.schema";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { Role } from "../enum/role.enum";

@Injectable()
export class AccountService {
  constructor(@InjectModel(Account.name) private accountModel: Model<AccountDocument>) {}

  async getById(id: string) {
    return this.accountModel.findById(id);
  }

  async validateAccount(email: string, password: string) {
    const account = await this.accountModel.findOne({ email });
    if (!account || !(await bcrypt.compare(password, account.password))) {
      throw new UnauthorizedException('Does not found account');
    }
    return account;
  }

  async findByEmail(email: string) {
    return this.accountModel.findOne({ email });
  }

  async create(email: string, password: string, role: Role = Role.USER) {
    const existing = await this.accountModel.findOne({ email });
    if (existing) {
      throw new ConflictException('Already existed account by email');
    }
    const hashed = await bcrypt.hash(password, 10);
    const account = new this.accountModel({ email, password: hashed, role });
    return account.save();
  }

  async saveRefreshToken(id: string, token: string) {
    return this.accountModel.findByIdAndUpdate(id, { refreshToken: token });
  }

  async clearRefreshToken(id: string) {
    return this.accountModel.findByIdAndUpdate(id, { refreshToken: null });
  }

  async findByRefreshToken(token: string) {
    return this.accountModel.findOne({ refreshToken: token });
  }

  async deleteAccount(id: string) {
    await this.accountModel.findByIdAndDelete(id);
  }
}