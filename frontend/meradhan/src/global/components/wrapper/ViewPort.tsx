import React from "react";
import Footer from "../footer/Footer";
import NewsLetter from "../footer/NewsLetter";
import NavBar from "../navbar/NavBar";
import { getSession } from "./_server/getSession";

export const revalidate = ;
export async function ViewPort({
  children,
  headerOnly,
}: {
  children?: React.ReactNode;
  headerOnly?: boolean;
}) {
  const session = await getSession();

  return (
    <div>
      <NavBar session={session} />
      {children}
      {!headerOnly && (
        <>
          <NewsLetter />
          <Footer />
        </>
      )}
    </div>
  );
}

export default ViewPort;
