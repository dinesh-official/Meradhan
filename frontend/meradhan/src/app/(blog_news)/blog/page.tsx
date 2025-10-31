import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
import BlogView from "./BlogView";
import { fetchBlogsData } from "./_gql/blogs.gql";
export const revalidate = 0;
async function page() {
  const data = await fetchBlogsData();
  // const items = data?.blogPosts_connection.nodes;
  return (
    <ViewPort>
      <div className="mb-[4rem] md:w-[80%] container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <BlogView />
      </div>
    </ViewPort>
  );
}

export default page;
