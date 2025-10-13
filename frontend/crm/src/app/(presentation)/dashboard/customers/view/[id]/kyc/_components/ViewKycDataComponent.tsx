import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import StickyHeader from "./StickyHeader";
import AadhaarCardInfo from "./cards/AadhaarCardInfo";
import AdharaCard from "./cards/AdharaCard";
import { BankCard } from "./cards/BankCard";
import CustomerOverViewCard from "./cards/CustomerOverViewCard";
import { DematCard } from "./cards/DematCard";
import KYCVerificationStatusCard from "./cards/KYCVerificationStatusCard";
import PanCard from "./cards/PanCard";
import PanCardInfoCard from "./cards/PanCardInfoCard";
import PersonalInformationCard from "./cards/PersonalInformationCard";
import RiskProfileQuestion, {
  RiskProfileAnsOption,
} from "./cards/riskprofile/RiskProfileQuestion";

function ViewKycDataComponent() {
  return (
    <div className="flex flex-col gap-5 relative">
      <div className="grid xl:grid-cols-2 gap-5">
        <CustomerOverViewCard
          name="Rahul Sharma"
          customerSince="15 Jul 2020"
          kycStatus={true}
        />
        <KYCVerificationStatusCard
          kycLevel="Full"
          overallStatus="Verified"
          verifiedBy="Rahul Sharma (Compliance Officer)"
          verifiedDate="13 Oct 2025, 11:45 AM"
        />{" "}
      </div>

      <StickyHeader />

      {/* Personal Information */}
      <div className="scroll-mt-16" id="personal-info">
        <PersonalInformationCard
          photoUrl="/images/user.jpeg"
          signatureUrl="/images/sign.jpg"
          fullName="Rahul Sharma"
          dateOfBirth="1996-07-15"
          gender="Male"
          maritalStatus="Single"
          fatherOrSpouseName="Rajesh Sharma"
          relationshipWithPerson="Son"
          motherName="Anita Sharma"
          qualification="Graduate"
          occupationType="Salaried"
          annualGrossIncome="₹6,00,000"
          nationality="Indian"
          residentialStatus="Resident Indian"
        />{" "}
      </div>

      {/* Identity Documents */}
      <div className="scroll-mt-16  flex flex-col gap-5" id="identity-docs">
        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8">
              <PanCard
                panNumber="AADPM2907K"
                name="Rahul Sharma"
                fatherName="Rajesh Kumar Sharma"
                dateOfBirth="21/10/1980"
                isVerified={true}
              />
              <AdharaCard
                name="Rahul Sharma"
                dateOfBirth="15/07/1996"
                gender="Male"
                aadhaarNumberMasked="xxx-xxx-xxx-1234"
                isVerified={true}
              />
            </div>
          </CardContent>
        </Card>
        <PanCardInfoCard
          panCardNumber="AADPM2907K"
          Name="Rahul Sharma"
          DateOFBirth="15 Jul 1996"
          gender="Male"
          nameVerificationStatus={true}
          panVerificationStatus={true}
          verificationTimeStamp="13 Oct 2025, 10:45 AM"
        />{" "}
        <AadhaarCardInfo
          aadhaarNumber="1234-5678-9012"
          name="Rahul Sharma"
          nameVerificationStatus={true}
          dateOfBirth="15 Jul 1996"
          gender="Male"
          permanentAddress={{
            addressLine1: "A-32, Sector 10 Main Road",
            addressLine2: "Near City Park",
            postOffice: "Noida Sector 10",
            district: "Gautam Buddha Nagar",
            stateName: "Uttar Pradesh",
            pinCode: "201301",
            country: "India",
            fullAddress:
              "A-32, Sector 10 Main Road, Near City Park, Noida, Gautam Buddha Nagar, Uttar Pradesh, 201301, India",
          }}
          currentAddress={{
            addressLine1: "Flat 205, MG Road",
            addressLine2: "Opposite Metro Station",
            postOffice: "Gurugram H.O",
            district: "Gurugram",
            stateName: "Haryana",
            pinCode: "122002",
            country: "India",
            fullAddress:
              "Flat 205, MG Road, Opposite Metro Station, Gurugram, Haryana, 122002, India",
          }}
          verificationTimeStamp="13 Oct 2025, 10:30 AM"
        />
      </div>

      {/* PAN Details */}
      <div className="scroll-mt-16" id="pan-details">
        <PanCardInfoCard
          panCardNumber="AADPM2907K"
          Name="Rahul Sharma"
          DateOFBirth="15 Jul 1996"
          gender="Male"
          nameVerificationStatus={true}
          panVerificationStatus={true}
          verificationTimeStamp="13 Oct 2025, 10:45 AM"
        />{" "}
      </div>

      {/* Aadhaar & Address */}
      <div className="scroll-mt-16" id="aadhaar-address">
        <AadhaarCardInfo
          aadhaarNumber="1234-5678-9012"
          name="Rahul Sharma"
          nameVerificationStatus={true}
          dateOfBirth="15 Jul 1996"
          gender="Male"
          permanentAddress={{
            addressLine1: "A-32, Sector 10 Main Road",
            addressLine2: "Near City Park",
            postOffice: "Noida Sector 10",
            district: "Gautam Buddha Nagar",
            stateName: "Uttar Pradesh",
            pinCode: "201301",
            country: "India",
            fullAddress:
              "A-32, Sector 10 Main Road, Near City Park, Noida, Gautam Buddha Nagar, Uttar Pradesh, 201301, India",
          }}
          currentAddress={{
            addressLine1: "Flat 205, MG Road",
            addressLine2: "Opposite Metro Station",
            postOffice: "Gurugram H.O",
            district: "Gurugram",
            stateName: "Haryana",
            pinCode: "122002",
            country: "India",
            fullAddress:
              "Flat 205, MG Road, Opposite Metro Station, Gurugram, Haryana, 122002, India",
          }}
          verificationTimeStamp="13 Oct 2025, 10:30 AM"
        />
      </div>

      {/* Demat Accounts */}
      <div className="scroll-mt-16" id="demat-accounts">
        <Card>
          <CardHeader>
            <CardTitle>Demat Accounts Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3  gap-5">
              <DematCard
                dpId="IN301151"
                clientId="25112106"
                depository="CDSL"
                accountType="SINGLE"
                pan1={{ value: "AADPM2907K", verified: false }}
                pan2={{ value: "Not applicable" }}
                pan3={{ value: "Not applicable" }}
                depositoryParticipantName="sadad"
                isDefault={true}
                verifiedOn="01 Oct 2025, 11:59 AM"
              />
              <DematCard
                dpId="IN301151"
                clientId="25112106"
                depository="CDSL"
                accountType="SINGLE"
                pan1={{ value: "AADPM2907K", verified: false }}
                pan2={{ value: "Not applicable" }}
                pan3={{ value: "Not applicable" }}
                depositoryParticipantName="sadad"
                isDefault={true}
                verifiedOn="01 Oct 2025, 11:59 AM"
              />
              <DematCard
                dpId="IN301151"
                clientId="25112106"
                depository="CDSL"
                accountType="SINGLE"
                pan1={{ value: "AADPM2907K", verified: false }}
                pan2={{ value: "Not applicable" }}
                pan3={{ value: "Not applicable" }}
                depositoryParticipantName="sadad"
                isDefault={true}
                verifiedOn="01 Oct 2025, 11:59 AM"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      <div className="scroll-mt-16" id="bank-accounts">
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-5">
              <BankCard
                bankName="Axis Bank"
                accountNumber="1234567890"
                ifscCode="UTIB0000056"
                branch="GURGAON"
                verifiedOn="01 Oct 2025, 08:24 PM"
                isDefault={true}
                verified={true}
              />
              <BankCard
                bankName="Axis Bank"
                accountNumber="1234567890"
                ifscCode="UTIB0000056"
                branch="GURGAON"
                verifiedOn="01 Oct 2025, 08:24 PM"
                isDefault={true}
                verified={true}
              />
              <BankCard
                bankName="Axis Bank"
                accountNumber="1234567890"
                ifscCode="UTIB0000056"
                branch="GURGAON"
                verifiedOn="01 Oct 2025, 08:24 PM"
                isDefault={true}
                verified={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Profile */}
      <div className="scroll-mt-16" id="risk-profile">
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">Investment Experience</CardTitle>
            <div className="mt-4 flex flex-col gap-5">
              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption active>None</RiskProfileAnsOption>
                <RiskProfileAnsOption>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption>Above 5 Years</RiskProfileAnsOption>
              </RiskProfileQuestion>

              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption>None</RiskProfileAnsOption>
                <RiskProfileAnsOption>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption active>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption>Above 5 Years</RiskProfileAnsOption>
              </RiskProfileQuestion>

              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption>None</RiskProfileAnsOption>
                <RiskProfileAnsOption active>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption>Above 5 Years</RiskProfileAnsOption>
              </RiskProfileQuestion>

              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption>None</RiskProfileAnsOption>
                <RiskProfileAnsOption>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption active>
                  Above 5 Years
                </RiskProfileAnsOption>
              </RiskProfileQuestion>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance */}
      <div className="scroll-mt-16" id="compliance">
        <Card>
          <CardHeader>
            <CardTitle>SEBI & Compliance Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">Compliance Confirmations</CardTitle>
            <p className="flex justify-start items-center gap-3 mt-3">
              <Checkbox /> I hereby confirm that I am not a Politically Exposed
              Person (PEP) nor related to any PEP
            </p>
            <p className="flex justify-start items-center gap-3 mt-2">
              <Checkbox /> I hereby confirm that I am not a person and/or entity
              debarred from accessing the securities market or dealing in
              securities, as per directions or orders issued by SEBI
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ViewKycDataComponent;
