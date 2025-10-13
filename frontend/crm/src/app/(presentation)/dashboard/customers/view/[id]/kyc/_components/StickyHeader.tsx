const navItems = [
  { id: "personal-info", label: "Personal Information" },
  { id: "identity-docs", label: "Identity Documents" },
  { id: "pan-details", label: "PAN Details" },
  { id: "aadhaar-address", label: "Aadhaar & Address" },
  { id: "demat-accounts", label: "Demat Accounts" },
  { id: "bank-accounts", label: "Bank Accounts" },
  { id: "risk-profile", label: "Risk Profile" },
  { id: "compliance", label: "Compliance" },
];

export default function StickyHeader() {
  return (
    <div className="w-full h-16 bg-white z-40 select-none  text-nowrap overflow-auto border-gray-100 sticky -top-8 lg:pt-0 pt-4 border rounded-lg flex flex-row gap-7 justify-start px-7 text-gray-700 font-medium items-center">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="transition-all hover:text-primary cursor-pointer"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
