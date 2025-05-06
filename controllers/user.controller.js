import { Order } from '../models/models.js';
import jwt from 'jsonwebtoken';

const get = (req, res) => {
    try {
      res.render('create-order'); // أو أي رد مناسب
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

const createOrder = async (req, res) => {
    try {
        const {name, mobile,city, nearestPoint, note } = req.body;
        const images = req.imageLinks;

    
        const order = await Order.create({
        name,
        mobile,
        city,
        nearestPoint,
        note,
        images
        });

        if (!order) {
            return res.status(400).json({ message: 'Error creating order' });
        }

         // إنشاء التوكن
         const token = jwt.sign(
            { id: order.id, name: order.name, mobile: order.mobile },
            process.env.JWT_SECRET,
            { expiresIn: '300d' }
        );

        // تخزين التوكن في الكوكيز
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 300 * 24 * 60 * 60 * 1000, // 300 days
        });


    
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order', error });
    }
    }

const getOrders = async (req, res) => {
    try {
        const { page , limit, offset} = req.pagination;

        const {count , rows} = await Order.findAndCountAll({
            limit,
            offset,
            order:[['created_at', 'DESC']],
            
        });
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            items: rows,});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
}

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching order', error });
    }
}

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        

    
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
    
        await order.update({
            orderStatus,
        });
    
        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating order', error });
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
    
        await order.destroy();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting order', error });
    }
}

export { createOrder, getOrders, getOrderById, updateOrder, deleteOrder,get};