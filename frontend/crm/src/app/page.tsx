import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function MainPage() {
  const cookie = await cookies();
  if (cookie.get("token")) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

}

export default MainPage;
