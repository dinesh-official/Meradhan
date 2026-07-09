
interface SectionHeaderProps {
  title: string;
  highlightedWord?: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ 
  title, 
  highlightedWord, 
  description, 
  className = "" 
}: SectionHeaderProps) {
  const renderTitle = () => {
    if (!highlightedWord) {
      return <h1 className="text-3xl quicksand-medium">{title}</h1>;
    }

    const parts = title.split(highlightedWord);
    return (
      <h1 className="text-3xl quicksand-medium">
        {parts[0]}
        <span className="font-medium text-secondary">{highlightedWord}</span>
        {parts[1]}
      </h1>
    );
  };

  return (
    <div className={`flex flex-col gap-3 py-10 ${className}`}>
      {renderTitle()}
      {description && <p>{description}</p>}
    </div>
  );
}