import { dataMatcherUtils } from "@/global/utils/matcher";

const isNameMatched = dataMatcherUtils.areNamesMatched(
    dataMatcherUtils.splitFullName("J.Anitta"),
    {
        firstName: "Anitta",
        middleName: "",
        lastName: "",
    },
);
console.log(dataMatcherUtils.splitFullName("J.Anitta"));
console.log(isNameMatched);