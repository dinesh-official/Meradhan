import { ContactCard } from "./ContactCard";

interface AddressSectionProps {
  title: string;
  address: string;
  highlightedWord?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contact: any
}

export function AddressSection({
  title,
  address,
  highlightedWord,
  contact
}: AddressSectionProps) {
  const renderTitle = () => {
    if (!highlightedWord) {
      return <h3 className="text-2xl lg:text-3xl quicksand-medium">{title}</h3>;
    }

    const parts = title.split(highlightedWord);
    return (
      <h3 className="text-2xl lg:text-3xl quicksand-medium">
        {parts[0]}
        <span className="font-medium text-secondary">{highlightedWord}</span>
        {parts[1]}
      </h3>
    );
  };

  return (
    <div className="container">
      <div className="flex lg:flex-row flex-col justify-between items-center lg:gap-5">
        <div className="flex flex-col gap-3 py-10 w-full">
          {renderTitle()}
          <p  >{address}</p>
        </div>
        <div  className="flex justify-end items-end w-full" >
          <ContactCard
            icon={contact.icon}
            label={contact.label}
            value={contact.value}
            href={contact.href}
            iconSize={20}
            className="w-full lg:min-w-96"
          />
        </div>
      </div>
    </div>
  );
}
