import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium" : "text-muted-foreground"}
                >
                  {item.label}
                </span>
              )}

              {!isLast && <span className="mx-2 text-muted-foreground">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;


