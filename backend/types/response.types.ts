import { EmailAuthService } from "../src/resource/auth/emailAuth.service";
import type { CustomerProfileService } from "../src/resource/crm/customers/customer.service";
import type { LeadsFollowUpManager } from "../src/resource/crm/leads/manager/leadFollowup.manager";
import type { LeadManager } from "../src/resource/crm/leads/manager/leads.manager";
import type { CrmUserService } from "../src/resource/crm/users/crmusers.service";

type EmailAuthServiceType = InstanceType<typeof EmailAuthService>;

export interface AuthDataTypes {
    SessionData: Awaited<ReturnType<EmailAuthServiceType["getSession"]>>,
}

type CustomerProfileServiceType = InstanceType<typeof CustomerProfileService>;
export interface CustomerProfileDataTypes {
    NewCustomerProfileData: Awaited<ReturnType<CustomerProfileServiceType["createCustomerProfile"]>>,
    FilterCustomersProfileData: Awaited<ReturnType<CustomerProfileServiceType["filterCustomers"]>>,
    CustomerProfileData: Awaited<ReturnType<CustomerProfileServiceType["getCustomerProfile"]>>,
    CustomerFullProfileData: Awaited<ReturnType<CustomerProfileServiceType["getFullCustomerProfile"]>>,
    UpdateCustomerProfileData: Awaited<ReturnType<CustomerProfileServiceType["updateCustomerProfile"]>>,
    DeleteCustomerProfileData: Awaited<ReturnType<CustomerProfileServiceType["removeCustomerProfile"]>>,
}


type LeadsManagerServiceType = InstanceType<typeof LeadManager>;
export interface LeadsDataTypes {
    NewLeadData: Awaited<ReturnType<LeadsManagerServiceType["createNewLead"]>>,
    FilterLeadsData: Awaited<ReturnType<LeadsManagerServiceType["filterLead"]>>,
    LeadData: Awaited<ReturnType<LeadsManagerServiceType["getLeadById"]>>,
    UpdateLeadData: Awaited<ReturnType<LeadsManagerServiceType["updateLead"]>>,
    DeleteLeadData: Awaited<ReturnType<LeadsManagerServiceType["deleteLead"]>>,
}

type LeadsFollowUpManagerServiceType = InstanceType<typeof LeadsFollowUpManager>;
export interface LeadsDataTypes {
    NewLeadFollowUpData: Awaited<ReturnType<LeadsFollowUpManagerServiceType["createNewFollowUpNote"]>>,
    LeadFollowUpData: Awaited<ReturnType<LeadsFollowUpManagerServiceType["getFollowUpNotesByLeadId"]>>,
    UpdateLeadFollowUpData: Awaited<ReturnType<LeadsFollowUpManagerServiceType["updateFollowUpNote"]>>,
    DeleteLeadFollowUpData: Awaited<ReturnType<LeadsFollowUpManagerServiceType["deleteFollowUpNote"]>>,
}


type UsersServiceType = InstanceType<typeof CrmUserService>;
export interface CrmUsersDataTypes {
    NewUserUpData: Awaited<ReturnType<UsersServiceType["createNewUser"]>>,
    UserUpData: Awaited<ReturnType<UsersServiceType["findUser"]>>,
    UpdateUserUpData: Awaited<ReturnType<UsersServiceType["updateUser"]>>,
    DeleteUserUpData: Awaited<ReturnType<UsersServiceType["deleteUser"]>>,
    FilterUsersData: Awaited<ReturnType<UsersServiceType["findManyUser"]>>,
}

