import { Router } from "express";
import { createOrder, getOrderById,getOrders,updateOrder,deleteOrder } from "../controllers/user.controller.js";
import paginationMiddleware from "../middlewares/pagination.js";
import {uploadImagesMiddleware}  from "../middlewares/upload.js";


const router = Router();
// Create a new user
router.post("/", uploadImagesMiddleware, createOrder);
// Get all users with pagination
router.get("/", paginationMiddleware, getOrders);
// Get a user by ID
router.get("/:id", getOrderById);
// Update a user by ID
router.post("/:id", updateOrder);
// Delete a user by ID
router.delete("/:id", deleteOrder);

export default router;