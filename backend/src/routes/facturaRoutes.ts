import { Router } from "express";
import {
  deleteTripFactura,
  downloadTripFacturaFile,
  listTripFacturas,
  uploadTripFactura,
} from "../controllers/facturaController";
import { verifyToken } from "../middlewares/auth";
import { uploadFacturaDocs } from "../middlewares/upload";

const router = Router({ mergeParams: true });

router.get("/", verifyToken, listTripFacturas);
router.get("/:facturaId/file", verifyToken, downloadTripFacturaFile);
router.post("/", verifyToken, uploadFacturaDocs.any(), uploadTripFactura);
router.delete("/:facturaId", verifyToken, deleteTripFactura);

export default router;
