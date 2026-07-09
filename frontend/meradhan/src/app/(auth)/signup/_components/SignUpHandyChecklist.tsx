const items = ["PAN", "Aadhaar", "Bank Details", "Demat Details"];

function SignUpHandyChecklist() {
  return (
    <div className="bg-muted/60 p-4 rounded-lg w-full">
      <p className="text-gray-700 text-sm">
        Keep these handy before you start
      </p>
      <ul className="gap-x-4 gap-y-1.5 grid grid-cols-2 mt-2.5 text-gray-600 text-sm">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="bg-gray-400 rounded-full shrink-0 size-1.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SignUpHandyChecklist;
