import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient } from "@/core/config/service-clients";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { cn } from "@/lib/utils";
import apiGateway, {
  ApiError,
  GetCustomerResponseById,
} from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineArrowRight } from "react-icons/md";

function RiskProfiling({
  profile,
  allowSave = true,
}: {
  profile: GetCustomerResponseById["responseData"];
  allowSave?: boolean;
}) {
  const [riskProfile, setRiskProfile] = useState(profile?.riskProfile?.data);

  const updateAnswer = (index: number, answer: string) => {
    const updatedProfile = [...riskProfile];
    updatedProfile[index].ans = answer;
    setRiskProfile(updatedProfile);
  };

  const saveRiskProfileMutation = useMutation({
    mutationKey: ["save-risk-profile"],
    mutationFn: async () => {
      const apiModel = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
        apiClientCaller
      );
      return await apiModel.setRiskProfile(riskProfile);
    },
    onSuccess: (data) => {
      console.log("Risk profile saved successfully", data);
      toast.success("Risk profile saved successfully");
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
    },
    onError: (error: unknown) => {
      console.error("Error saving risk profile", error);
      if (error instanceof ApiError) {
        toast.error(
          `${error.response?.data.message ||
          "An error occurred while saving the risk profile."
          } `
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
  });

  return (
    <Card className="px-0 border-none">
      <CardHeader className="px-0">
        <CardTitle className="font-normal">Investment Experience</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col gap-5">
          {riskProfile?.map((question, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <p className="font-medium text-sm">{question.qus}</p>
              <div className="gap-5 grid lg:grid-cols-4 text-sm">
                {question.opt.map((option, n_idx) => (
                  <div
                    key={n_idx}
                    className={cn(
                      "p-2.5 border border-gray-200 rounded-md text-center cursor-pointer",
                      option === profile.riskProfile.data[idx].ans &&
                      "bg-secondary border-secondary text-white"
                    )}
                    onClick={() => {
                      updateAnswer(idx, option);
                    }}
                  >
                    <p>{option}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div>
        {allowSave && <Button
          //   disabled={!isAllowToContinue()}
          //   onClick={jumpNext}
          disabled={saveRiskProfileMutation.isPending}
          onClick={() => saveRiskProfileMutation.mutate()}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          Save & Continue <MdOutlineArrowRight />
        </Button>}
      </div>
    </Card>
  );
}

export default RiskProfiling;
