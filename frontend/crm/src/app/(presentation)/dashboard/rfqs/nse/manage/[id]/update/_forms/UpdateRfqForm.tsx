"use client";
import React, { useState } from "react";

interface UpdateRfqFormValues {
  number: string;
  settlementType: string;
  value: string;
  quantity: string;
  yieldType: string;
  yield: string;
  calcMethod: string;
  price: string;
  gtdFlag: string;
  endTime: string;
  quoteNegotiable: string;
  valueNegotiable: string;
  minFillValue: string;
  valueStepSize: string;
  anonymous: string;
  access: string;
  groupList: string[];
  participantList: string[];
  category: string;
  rating: string;
  remarks: string;
}

interface UpdateRfqFormProps {
  onSubmit?: (data: UpdateRfqFormValues) => void;
  initialValues?: Partial<UpdateRfqFormValues>;
}

const defaultValues: UpdateRfqFormValues = {
  number: "",
  settlementType: "",
  value: "",
  quantity: "",
  yieldType: "",
  yield: "",
  calcMethod: "",
  price: "",
  gtdFlag: "",
  endTime: "",
  quoteNegotiable: "",
  valueNegotiable: "",
  minFillValue: "",
  valueStepSize: "",
  anonymous: "",
  access: "",
  groupList: [],
  participantList: [],
  category: "",
  rating: "",
  remarks: "",
};

const UpdateRfqForm: React.FC<UpdateRfqFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [form, setForm] = useState<UpdateRfqFormValues>({
    ...defaultValues,
    ...initialValues,
    groupList: initialValues?.groupList ?? [],
    participantList: initialValues?.participantList ?? [],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    // For groupList and participantList, keep as array
    if (name === "groupList" || name === "participantList") {
      setForm((prev) => ({
        ...prev,
        [name]: value.split(",").map((v) => v.trim()),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="update-rfq-form">
      <label>
        RFQ Number*
        <input
          name="number"
          maxLength={15}
          value={form.number}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Settlement Type*
        <select
          name="settlementType"
          value={form.settlementType}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="0">T+0</option>
          <option value="1">T+1</option>
        </select>
      </label>
      <label>
        Value (in crores)*
        <input
          name="value"
          type="number"
          step="0.0000000001"
          value={form.value}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Quantity
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
        />
      </label>
      <label>
        Yield Type*
        <select
          name="yieldType"
          value={form.yieldType}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="YTM">YTM</option>
          <option value="YTP">YTP</option>
          <option value="YTC">YTC</option>
        </select>
      </label>
      <label>
        Yield*
        <input
          name="yield"
          type="number"
          step="0.0001"
          value={form.yield}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Calculation Method*
        <select
          name="calcMethod"
          value={form.calcMethod}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="M">Money Market</option>
          <option value="O">Other</option>
        </select>
      </label>
      <label>
        Price
        <input
          name="price"
          type="number"
          step="0.0001"
          value={form.price}
          onChange={handleChange}
        />
      </label>
      <label>
        GTD Flag
        <select name="gtdFlag" value={form.gtdFlag} onChange={handleChange}>
          <option value="">Valid till endTime</option>
          <option value="Y">Valid till day</option>
        </select>
      </label>
      <label>
        End Time
        <input
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange}
        />
      </label>
      <label>
        Quote Negotiable
        <select
          name="quoteNegotiable"
          value={form.quoteNegotiable}
          onChange={handleChange}
        >
          <option value="">Not negotiable</option>
          <option value="Y">Negotiable</option>
        </select>
      </label>
      <label>
        Value Negotiable
        <select
          name="valueNegotiable"
          value={form.valueNegotiable}
          onChange={handleChange}
        >
          <option value="">Not negotiable</option>
          <option value="Y">Negotiable</option>
        </select>
      </label>
      <label>
        Min Fill Value
        <input
          name="minFillValue"
          type="number"
          step="0.0000000001"
          value={form.minFillValue}
          onChange={handleChange}
        />
      </label>
      <label>
        Value Step Size
        <input
          name="valueStepSize"
          type="number"
          step="0.0000000001"
          value={form.valueStepSize}
          onChange={handleChange}
        />
      </label>
      <label>
        Anonymous
        <select name="anonymous" value={form.anonymous} onChange={handleChange}>
          <option value="">Not anonymous</option>
          <option value="Y">Anonymous</option>
        </select>
      </label>
      <label>
        Access
        <select name="access" value={form.access} onChange={handleChange}>
          <option value="">Select</option>
          <option value="1">OTM</option>
          <option value="2">OTO</option>
          <option value="3">IST</option>
        </select>
      </label>
      <label>
        Group List (comma separated)
        <input
          name="groupList"
          value={form.groupList.join(", ")}
          onChange={handleChange}
        />
      </label>
      <label>
        Participant List (comma separated)
        <input
          name="participantList"
          value={form.participantList.join(", ")}
          onChange={handleChange}
        />
      </label>
      <label>
        Category
        <input
          name="category"
          maxLength={30}
          value={form.category}
          onChange={handleChange}
        />
      </label>
      <label>
        Rating
        <input
          name="rating"
          maxLength={10}
          value={form.rating}
          onChange={handleChange}
        />
      </label>
      <label>
        Remarks
        <textarea
          name="remarks"
          maxLength={100}
          value={form.remarks}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Update RFQ</button>
    </form>
  );
};

export default UpdateRfqForm;
