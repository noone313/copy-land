import { Router } from "express";
import { 
  createOrder, 
  getOrderById,
  getAllOrders,
  deleteOrder,
  getCreateOrder,
  updateOrderStatus
} from "../controllers/user.controller.js";
import {paginate} from "../middlewares/pagination.js";
import { uploadImagesMiddleware } from "../middlewares/upload.js";

const router = Router();

// ترتيب المسارات بشكل صحيح
router.get("/create", getCreateOrder); // يجب أن يكون قبل المسارات الديناميكية

// باقي المسارات
router.post("/", uploadImagesMiddleware, createOrder);
router.get('/', paginate,getAllOrders);
router.post('/orderstatus/:id', updateOrderStatus);
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);

export default router;