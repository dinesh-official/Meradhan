"use client";

import { InputField } from "@/global/elements/inputs/InputField";
import { RadioYesNoField } from "@/global/elements/inputs/RadioYesNoField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { useEffect } from "react";

interface Step3AddressDetailsProps {
    formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step3AddressDetails({ formHook }: Step3AddressDetailsProps) {
    const { formData, updateStepData, getFieldError } = formHook;

    const sameAsCurrent = formData.step3.permanentAddress.sameAsCurrent === "yes";

    // Auto-fill permanent address if same as current
    useEffect(() => {
        if (sameAsCurrent) {
            updateStepData("step3", {
                permanentAddress: {
                    ...formData.step3.permanentAddress,
                    sameAsCurrent: "yes",
                    addressLine1: formData.step3.currentAddress.addressLine1,
                    postOffice: formData.step3.currentAddress.postOffice,
                    cityOrDistrict: formData.step3.currentAddress.cityOrDistrict,
                    state: formData.step3.currentAddress.state,
                    pinCode: formData.step3.currentAddress.pinCode,
                    country: formData.step3.currentAddress.country,
                    fullAddress: formData.step3.currentAddress.fullAddress,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sameAsCurrent, formData.step3.currentAddress]);

    // Update full address when other fields change
    const updateCurrentAddress = (field: string, value: string) => {
        const updated = {
            ...formData.step3.currentAddress,
            [field]: value,
        };
        const fullAddress = `${updated.addressLine1}, ${updated.postOffice}, ${updated.cityOrDistrict}, ${updated.state} - ${updated.pinCode}, ${updated.country}`;
        updateStepData("step3", {
            currentAddress: {
                ...updated,
                fullAddress,
            },
        });
    };

    const updatePermanentAddress = (field: string, value: string) => {
        const updated = {
            ...formData.step3.permanentAddress,
            [field]: value,
        };
        if (field !== "sameAsCurrent" && !sameAsCurrent) {
            const fullAddress = `${updated.addressLine1 || ""}, ${updated.postOffice || ""}, ${updated.cityOrDistrict || ""}, ${updated.state || ""} - ${updated.pinCode || ""}, ${updated.country || ""}`;
            updateStepData("step3", {
                permanentAddress: {
                    ...updated,
                    fullAddress,
                },
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Current Address */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Address</h3>
                <InputField
                    id="currentAddressLine1"
                    label="Address Line 1"
                    placeholder="Enter address line 1"
                    required
                    value={formData.step3.currentAddress.addressLine1}
                    onChangeAction={(e) => updateCurrentAddress("addressLine1", e)}
                    error={getFieldError(3, "currentAddress.addressLine1")}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                        id="currentPostOffice"
                        label="Post Office"
                        placeholder="Enter post office"
                        required
                        value={formData.step3.currentAddress.postOffice}
                        onChangeAction={(e) => updateCurrentAddress("postOffice", e)}
                        error={getFieldError(3, "currentAddress.postOffice")}
                    />

                    <InputField
                        id="currentCityOrDistrict"
                        label="City / District"
                        placeholder="Enter city or district"
                        required
                        value={formData.step3.currentAddress.cityOrDistrict}
                        onChangeAction={(e) => updateCurrentAddress("cityOrDistrict", e)}
                        error={getFieldError(3, "currentAddress.cityOrDistrict")}
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <InputField
                        id="currentState"
                        label="State"
                        placeholder="Enter state"
                        required
                        value={formData.step3.currentAddress.state}
                        onChangeAction={(e) => updateCurrentAddress("state", e)}
                        error={getFieldError(3, "currentAddress.state")}
                    />

                    <InputField
                        id="currentPinCode"
                        label="PIN Code"
                        placeholder="Enter PIN code"
                        required
                        max={6}
                        value={formData.step3.currentAddress.pinCode}
                        onChangeAction={(e) => updateCurrentAddress("pinCode", e)}
                        error={getFieldError(3, "currentAddress.pinCode")}
                    />

                    <InputField
                        id="currentCountry"
                        label="Country"
                        placeholder="Enter country"
                        required
                        value={formData.step3.currentAddress.country}
                        onChangeAction={(e) => updateCurrentAddress("country", e)}
                        error={getFieldError(3, "currentAddress.country")}
                    />
                </div>

                <InputField
                    id="currentFullAddress"
                    label="Full Address (Auto-generated)"
                    placeholder="Full address"
                    disabled
                    value={formData.step3.currentAddress.fullAddress}
                />
            </div>

            {/* Permanent Address */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Permanent Address</h3>
                <RadioYesNoField
                    id="sameAsCurrent"
                    label="Same as Current Address"
                    required
                    value={formData.step3.permanentAddress.sameAsCurrent}
                    onChangeAction={(e) =>
                        updateStepData("step3", {
                            permanentAddress: {
                                ...formData.step3.permanentAddress,
                                sameAsCurrent: e as "yes" | "no",
                            },
                        })
                    }
                />

                {!sameAsCurrent && (
                    <>
                        <InputField
                            id="permanentAddressLine1"
                            label="Address Line 1"
                            placeholder="Enter address line 1"
                            required
                            value={formData.step3.permanentAddress.addressLine1 || ""}
                            onChangeAction={(e) => updatePermanentAddress("addressLine1", e)}
                            error={getFieldError(3, "permanentAddress.addressLine1")}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField
                                id="permanentPostOffice"
                                label="Post Office"
                                placeholder="Enter post office"
                                required
                                value={formData.step3.permanentAddress.postOffice || ""}
                                onChangeAction={(e) => updatePermanentAddress("postOffice", e)}
                                error={getFieldError(3, "permanentAddress.postOffice")}
                            />

                            <InputField
                                id="permanentCityOrDistrict"
                                label="City / District"
                                placeholder="Enter city or district"
                                required
                                value={formData.step3.permanentAddress.cityOrDistrict || ""}
                                onChangeAction={(e) => updatePermanentAddress("cityOrDistrict", e)}
                                error={getFieldError(3, "permanentAddress.cityOrDistrict")}
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <InputField
                                id="permanentState"
                                label="State"
                                placeholder="Enter state"
                                required
                                value={formData.step3.permanentAddress.state || ""}
                                onChangeAction={(e) => updatePermanentAddress("state", e)}
                                error={getFieldError(3, "permanentAddress.state")}
                            />

                            <InputField
                                id="permanentPinCode"
                                label="PIN Code"
                                placeholder="Enter PIN code"
                                required
                                max={6}
                                value={formData.step3.permanentAddress.pinCode || ""}
                                onChangeAction={(e) => updatePermanentAddress("pinCode", e)}
                                error={getFieldError(3, "permanentAddress.pinCode")}
                            />

                            <InputField
                                id="permanentCountry"
                                label="Country"
                                placeholder="Enter country"
                                required
                                value={formData.step3.permanentAddress.country || ""}
                                onChangeAction={(e) => updatePermanentAddress("country", e)}
                                error={getFieldError(3, "permanentAddress.country")}
                            />
                        </div>

                        <InputField
                            id="permanentFullAddress"
                            label="Full Address (Auto-generated)"
                            placeholder="Full address"
                            disabled
                            value={formData.step3.permanentAddress.fullAddress || ""}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

