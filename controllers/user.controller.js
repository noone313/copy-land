import { Order } from '../models/models.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';


const getCreateOrder = (req, res) => {
    try {
        
      res.render('createOrder');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

const createOrder = async (req, res) => {
    try {
        const {name, mobile,city,region, nearestPoint, note } = req.body;
        const images = req.imageLinks;

    
        const order = await Order.create({
        name,
        mobile,
        city,
        region,
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

    const getAllOrders = async (req, res) => {
        try {
          const { page, limit, offset } = req.pagination;
          const { search, orderStatus } = req.query;
      
          const whereClause = {};
          if (search) {
            whereClause[Op.or] = [
              { name: { [Op.iLike]: `%${search}%` } },
              { mobile: { [Op.iLike]: `%${search}%` } },
            ];
          }
          if (orderStatus) {
            whereClause.orderStatus = orderStatus;
          }
      
          const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
          });
      
          // إذا الطلب من AJAX (توقع JSON)، رجع JSON
          if (req.headers.accept?.includes('application/json')) {
            return res.status(200).json({
              totalItems: count,
              totalPages: Math.ceil(count / limit),
              currentPage: page,
              items: rows,
            });
          }
      
          res.render('allOrders'); 
        } catch (error) {
          console.error(error);
          res.status(500).render('allOrders', { error: error.message });
        }
      };
      

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

const updateOrderStatus = async (req, res) => {
    try {
      const id = req.params.id;
      const { orderStatus } = req.body;
  
      const order = await Order.findByPk(id);
      if (!order) return res.status(404).json({ error: 'طلب غير موجود' });
  
      order.orderStatus = orderStatus;
      await order.save();
  
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };

  

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



export { createOrder, getAllOrders, getOrderById,updateOrderStatus, deleteOrder,getCreateOrder};