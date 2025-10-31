import BondAddToWatchList from '@/global/components/Bond/BondAddToWatchList'
import { cn } from '@/lib/utils'
import { FaStar } from 'react-icons/fa6'

function BondInfoHeader() {
  return (
   <div className="flex flex-col gap-4">
        <div className="flex justify-between md:flex-row flex-col gap-5 md:items-center">
          <p className={cn("text-2xl font-medium", "quicksand-medium")}>
            ISIN:{" "}
            <span className="font-semibold text-secondary">INE01YL07342</span>
          </p>
          <div className="flex items-center gap-5">
            <div className="bg-muted text-primary max-w-[350px] px-2 py-0.5 gap-2 rounded-sm flex items-center">
              <div className="w-5">
                <FaStar size={17} className="text-secondary" />
              </div>
              <span className="line-clamp-1 text-sm ">
                A- CARE RATINGS LIMITED DT EARLYSALARY SERVICES
              </span>
            </div>
            <BondAddToWatchList />
          </div>
        </div>
        <h2
          className={cn(
            "md:text-3xl text-2xl quicksand-medium "
          )}
        >
          EARLYSALARY SERVICES PRIVATE LIMITED
        </h2>
        <p className="text-base">
          EARLYSALARY SERVICES PRIVATE LIMITED 10.90 NCD 04JN27 FVRS1LAC
        </p>
      </div>

  )
}

export default BondInfoHeader