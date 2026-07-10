import { stateData } from "./states"

export const getStateSortCode = (e: string) => {

    return stateData.find((s) => {

        return s.label.trim().toLowerCase() == e.trim().toLowerCase();
    })?.value
}