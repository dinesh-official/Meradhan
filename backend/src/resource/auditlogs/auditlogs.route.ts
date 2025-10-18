import { Router } from "express";

const router = Router()

router.all("/api/crm/tracking", (req, res) => {
    console.log(req.body,2);
    return res.send("OK")
})

export default router