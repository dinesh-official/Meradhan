import type { EmailAuthService } from "@resource/crm/auth/email_auth.service";
import type { CustomerProfileService } from "@resource/crm/customers/customer.service";
import type { LeadsFollowUpManagerService } from "@resource/crm/leads/services/lead_followup_manager.service";
import type { LeadManagerService } from "@resource/crm/leads/services/leads_manager.service";
import type { CrmUserService } from "@resource/crm/users/crmusers.service";


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


type LeadsManagerServiceType = InstanceType<typeof LeadManagerService>;
export interface LeadsDataTypes {
    NewLeadData: Awaited<ReturnType<LeadsManagerServiceType["createNewLead"]>>,
    FilterLeadsData: Awaited<ReturnType<LeadsManagerServiceType["filterLead"]>>,
    LeadData: Awaited<ReturnType<LeadsManagerServiceType["getLeadById"]>>,
    UpdateLeadData: Awaited<ReturnType<LeadsManagerServiceType["updateLead"]>>,
    DeleteLeadData: Awaited<ReturnType<LeadsManagerServiceType["deleteLead"]>>,
}

type LeadsFollowUpManagerServiceType = InstanceType<typeof LeadsFollowUpManagerService>;
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

