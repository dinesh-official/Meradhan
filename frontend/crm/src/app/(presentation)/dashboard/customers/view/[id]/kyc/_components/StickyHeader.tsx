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
    <div className="-top-8 z-40 sticky flex flex-row justify-start items-center gap-7 bg-white px-7 pt-4 lg:pt-0 border border-gray-100 rounded-lg w-full h-11 overflow-auto text-gray-700 text-nowrap select-none">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="font-medium hover:text-primary text-xs transition-all cursor-pointer"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
