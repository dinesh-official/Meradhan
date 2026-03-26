"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContactInput from "@/app/(pages)/contact-us/_components/ContactInput";
import CaptchaInput from "@/app/(auth)/signup/_components/CaptchaInput";
import Swal from "sweetalert2";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";

type PartnershipFormData = {
  organizationName: string;
  organizationType: string;
  city: string;
  state: string;
  website: string;
  fullName: string;
  designation: string;
  email: string;
  mobileNumber: string;
  partnershipModel: string;
  clientBase: string;
  message: string;
  consent: boolean;
};

const PartnershipForm = () => {
  const [formData, setFormData] = useState<PartnershipFormData>({
    organizationName: "",
    organizationType: "",
    city: "",
    state: "",
    website: "",
    fullName: "",
    designation: "",
    email: "",
    mobileNumber: "",
    partnershipModel: "",
    clientBase: "",
    message: "",
    consent: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PartnershipFormData, string>>
  >({});
  const [isCaptchaVerify, setIsCaptchaVerify] = useState(false);
  const [captchaErrorValue, setCaptchaErrorValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PartnershipFormData, string>> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!formData.organizationType) {
      newErrors.organizationType = "Organization type is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (
      !/^[0-9()+-\s]*$/.test(formData.mobileNumber) ||
      formData.mobileNumber.length < 10
    ) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }
    if (!formData.partnershipModel) {
      newErrors.partnershipModel = "Partnership model is required";
    }
    if (!formData.consent) {
      newErrors.consent = "You must agree to be contacted";
    }
    if (!isCaptchaVerify) {
      setCaptchaErrorValue("Captcha not verified");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isCaptchaVerify;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiClient = new apiGateway.meradhan.commonApi.CommonApi(
        apiClientCaller
      );
      await apiClient.partnershipSubmit({
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        city: formData.city,
        state: formData.state,
        website: formData.website || undefined,
        fullName: formData.fullName,
        designation: formData.designation,
        emailAddress: formData.email,
        mobileNumber: formData.mobileNumber,
        partnershipModel: formData.partnershipModel as
          | "distribution"
          | "api"
          | "white-label"
          | "institutional",
        clientBase: formData.clientBase || undefined,
        message: formData.message || undefined,
      });

      Swal.fire({
        imageUrl: "/images/icons/ok.png",
        title: "Thank you for reaching out!",
        text: "Your partnership request has been successfully submitted. Our team will review your details and contact you shortly.",
        confirmButtonText: "OK",
      });

      // Reset form
      setFormData({
        organizationName: "",
        organizationType: "",
        city: "",
        state: "",
        website: "",
        fullName: "",
        designation: "",
        email: "",
        mobileNumber: "",
        partnershipModel: "",
        clientBase: "",
        message: "",
        consent: false,
      });
      setIsCaptchaVerify(false);
      setCaptchaErrorValue("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (
    field: keyof PartnershipFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <section className="mb-16">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 quicksand-medium">
        Partner Enquiry Form
      </h2>
      <p className="text-gray-600 mb-8">
        Please fill in the details below. Our partnerships team will contact you
        within 1–2 business days.
      </p>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="font-normal text-xl quicksand-medium">
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Organization / Firm Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <ContactInput
                  placeholder="Enter organization name"
                  value={formData.organizationName}
                  onChange={(e) =>
                    updateField("organizationName", e.target.value)
                  }
                  error={errors.organizationName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type of Organization <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.organizationType}
                  onValueChange={(value) =>
                    updateField("organizationType", value)
                  }
                >
                  <SelectTrigger className="w-full bg-muted border-none rounded-sm">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="wealth-manager">
                      Wealth Manager / RIA
                    </SelectItem>
                    <SelectItem value="bank-nbfc">Bank / NBFC</SelectItem>
                    <SelectItem value="fintech">Fintech Platform</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.organizationType && (
                  <span className="text-xs text-red-600">
                    {errors.organizationType}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <ContactInput
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  error={errors.city}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <ContactInput
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  error={errors.state}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Website / Company Profile URL
                </label>
                <ContactInput
                  placeholder="https://example.com"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  error={errors.website}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <CardTitle className="font-normal text-xl quicksand-medium mb-4">
                Contact Person Details
              </CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <ContactInput
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    error={errors.fullName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <ContactInput
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={(e) => updateField("designation", e.target.value)}
                    error={errors.designation}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <ContactInput
                    placeholder="Enter email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={errors.email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <ContactInput
                    placeholder="Enter mobile number"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      updateField("mobileNumber", e.target.value)
                    }
                    error={errors.mobileNumber}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <CardTitle className="font-normal text-xl quicksand-medium mb-4">
                Partnership Information
              </CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interested Partnership Model{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.partnershipModel}
                    onValueChange={(value) =>
                      updateField("partnershipModel", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-muted border-none rounded-sm">
                      <SelectValue placeholder="Select partnership model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distribution">
                        Distribution / Referral
                      </SelectItem>
                      <SelectItem value="api">
                        API / Technology Integration
                      </SelectItem>
                      <SelectItem value="white-label">
                        White-Label Solution
                      </SelectItem>
                      <SelectItem value="institutional">
                        Institutional / Strategic Partnership
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.partnershipModel && (
                    <span className="text-xs text-red-600">
                      {errors.partnershipModel}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Approx. Client Base / AUM (Optional)
                  </label>
                  <ContactInput
                    placeholder="Enter approximate client base or AUM"
                    value={formData.clientBase}
                    onChange={(e) => updateField("clientBase", e.target.value)}
                    error={errors.clientBase}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Brief Description / Message
                  </label>
                  <Textarea
                    className="bg-muted shadow-none px-3 border-none rounded-sm placeholder:text-gray-500 min-h-[120px]"
                    placeholder="Tell us about your business and how you'd like to partner with MeraDhan"
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />
                  {errors.message && (
                    <span className="text-xs text-red-600">
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) =>
                    updateField("consent", checked === true)
                  }
                />
                <label
                  htmlFor="consent"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to be contacted by the MeraDhan partnerships team
                  regarding this enquiry.{" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.consent && (
                <span className="text-xs text-red-600 block mt-1">
                  {errors.consent}
                </span>
              )}
            </div>

            <div className="pt-4">
              <CaptchaInput
                onVerify={setIsCaptchaVerify}
                onChange={(e) => {
                  setIsCaptchaVerify(e);
                }}
                onValueChange={() => {
                  setCaptchaErrorValue("");
                }}
              />
              {captchaErrorValue && (
                <p className="text-xs text-red-600 mt-1">{captchaErrorValue}</p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? "Submitting..." : "Submit Partnership Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default PartnershipForm;
