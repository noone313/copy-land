import { Router } from "express";
import { 
  createOrder, 
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
  get
} from "../controllers/user.controller.js";
import paginationMiddleware from "../middlewares/pagination.js";
import { uploadImagesMiddleware } from "../middlewares/upload.js";

const router = Router();

// ترتيب المسارات بشكل صحيح
router.get("/create", get); // يجب أن يكون قبل المسارات الديناميكية

// باقي المسارات
router.post("/", uploadImagesMiddleware, createOrder);
router.get("/", paginationMiddleware, getOrders);
router.get("/:id", getOrderById);
router.post("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;