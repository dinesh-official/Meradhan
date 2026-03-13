import PageTitleDesc from "@/global/components/basic/page/PageTitleDesc";
import Image from "next/image";
function TitleSection() {
  return (
       <PageTitleDesc
          titleClassName="flex gap-3"
          title={
            <>
              Talk to
              <span className="flex font-semibold text-secondary">
                MeraDhan-GPT{" "}
                <Image
                  width={60}
                  height={60}
                  className="w-12 lg:w-14 h-12 lg:h-14"
                  alt="dhangpt-border.svg"
                  src={`/static/dhangpt-border.svg`}
                />
              </span>
            </>
          }
          description="Bonds sound confusing? DhanGPT’s got your back!"
          descClassName="text-sm"
        />
  )
}

export default TitleSection