import { useState } from "react";
import { z } from "zod";

const formSchemaZod = z
  .object({
    firstName: z.string().min(1, { message: "Enter your first name" }),
    lastName: z.string().min(1, { message: "Enter your last name" }),
    email: z.email({ message: "Provide a valid email ID" }),
    mobile: z
      .string()
      .min(10, { message: "Please provide a valid phone" })
      .regex(/^\d+$/, { message: "Please provide a valid phone" }),
    userType: z.string().min(1, { message: "Select correct user type" }),
    password: z
      .string()
      .regex(/[A-Z]/, { message: "Password is not matching with rule" })
      .regex(/[a-z]/, { message: "Password is not matching with rule" })
      .regex(/\d/, { message: "Password is not matching with rule" })
      .regex(/[@$!%*?&]/, { message: "Password is not matching with rule" })
      .min(4, { message: "Please enter password" }),
    confirmPassword: z.string().min(1, { message: "Enter confirm password" }),
    isAcceptedTerms: z.boolean().refine((val) => val === true, {
      message: "Must accept terms and conditions",
    }),
    isAcceptedWhatsapp: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUPFormSchemaType = z.infer<typeof formSchemaZod>;

export const useSignUpFormDataState = () => {
  const [signUpFormData, setSignUpFormData] = useState<
    SignUPFormSchemaType & {
      id: number | null;
    }
  >({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    userType: "INDIVIDUAL",
    isAcceptedTerms: false,
    isAcceptedWhatsapp: true,
  });

  const [signUpFormError, setSignUpFormError] = useState<
    Record<keyof SignUPFormSchemaType, string>
  >({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    userType: "",
    isAcceptedTerms: "",
    isAcceptedWhatsapp: "",
  });

  const handleSignUpFormChange = (
    key: keyof SignUPFormSchemaType | "id",
    value: string | boolean | number
  ) => {
    setSignUpFormData((prev) => ({ ...prev, [key]: value }));
    setSignUpFormError((prev) => ({ ...prev, [key]: "" })); // clear field error on change
  };

  const resetSignUpFormData = () => {
    setSignUpFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      userType: "INDIVIDUAL",
      isAcceptedTerms: false,
      isAcceptedWhatsapp: false,
      id: null,
    });
    setSignUpFormError({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      userType: "",
      isAcceptedTerms: "",
      isAcceptedWhatsapp: "",
    });
  };

  const validateForm = () => {
    const result = formSchemaZod.safeParse(signUpFormData);

    if (!result.success) {
      const newErrors = { ...signUpFormError };

      result.error?.issues?.forEach((err) => {
        const field = err.path[0] as keyof SignUPFormSchemaType;
        newErrors[field] = err.message;
      });

      setSignUpFormError(newErrors);
      return false;
    }

    // No errors — clear old ones
    setSignUpFormError({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      userType: "",
      isAcceptedTerms: "",
      isAcceptedWhatsapp: "",
    });

    return true;
  };

  return {
    signUpFormData,
    signUpFormError,
    handleSignUpFormChange,
    validateForm,
    resetSignUpFormData,
  };
};

export type SignUPFormDataHook = ReturnType<typeof useSignUpFormDataState>;
