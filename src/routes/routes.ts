import express from "express";
import { searchMentors } from "../controller/searchMentors";

const router = express.Router();

router.post("/api/search", searchMentors)

export default router;