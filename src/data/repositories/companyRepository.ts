import { storage } from "../storage";
import type { CompanyProfile } from "../../types/company";

const KEY = "fieldrate.company";

export const companyRepository = {
  async get(): Promise<CompanyProfile> {
    return storage.get<CompanyProfile>(KEY, {
      name: "",
      phone: "",
      email: "",
      license: "",
      signature: "",
    });
  },

  async set(profile: CompanyProfile) {
    await storage.set(KEY, profile);
  },
};
