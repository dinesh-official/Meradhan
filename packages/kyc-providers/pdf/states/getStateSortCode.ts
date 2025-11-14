import { stateData } from "./states"

export const getStateSortCode = (e: string) => {
    return stateData.find((d) => {
        d.label.toLowerCase() == e.toLowerCase();
    })?.value
}