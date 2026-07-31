import getOrderInfo from "@modules/order/getOrderInfo";

getOrderInfo(88).then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
