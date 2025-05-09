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

 import FormData from 'form-data';
import fetch from 'node-fetch';

const sendToWaseet = async (req, res) => {
    try {
        const { orderid, items_number, price, package_size } = req.body;
        
        console.log('Received data from form:', {
            orderid,
            items_number,
            price,
            package_size
        });

        // البحث عن الطلب في قاعدة البيانات
        const order = await Order.findByPk(orderid);
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'الطلب غير موجود' 
            });
        }

        // ========== معالجة رقم الهاتف ==========
        let clientMobile = order.mobile.toString().trim();
        clientMobile = clientMobile.replace(/\D/g, '').replace(/^0+/, '');
        
        if (clientMobile.length !== 10 || !/^[0-9]{10}$/.test(clientMobile)) {
            return res.status(400).json({
                success: false,
                message: 'رقم الهاتف يجب أن يتكون من 10 أرقام بدون كود الدولة',
                provided_mobile: order.mobile
            });
        }

        const formattedPhone = `+964${clientMobile}`;

        // ========== إعداد FormData ==========
        const form = new FormData();
        
        // الحقول المطلوبة
        form.append('client_name', order.name || '');
        form.append('client_mobile', formattedPhone);
        form.append('city_id', order.city);
        form.append('region_id', order.region);
        form.append('location', order.nearestPoint || '');
        form.append('type_name', 'استنساخ');
        form.append('items_number', items_number);
        form.append('price', price);
        form.append('package_size', package_size);
        form.append('replacement', 0);
        
        // الحقول الاختيارية
        if (order.note) form.append('merchant_notes', order.note);

        // ========== إرسال الطلب إلى API ==========
        const response = await fetch('https://api.alwaseet-iq.net/v1/merchant/create-order?token=@@a550a087e682a490c79bc1aca89d1554', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const responseData = await response.json();
        
        // ========== معالجة الرد ==========
        if (!response.ok || !responseData.status) {
            console.error('Waseet API Error:', responseData);
            return res.status(400).json({
                success: false,
                message: responseData.msg || 'فشل إرسال الطلب',
                apiError: responseData
            });
        }

        // ========== في حالة النجاح ==========
        const orderData = responseData.data?.[0] || {};
        
        await order.update({
            status: 'sent_to_waseet',
            waseet_response: JSON.stringify(responseData),
            waseet_reference: orderData.qr_id || null
        });

        return res.status(200).json({
            success: true,
            message: 'تم إرسال الطلب بنجاح',
            reference: orderData.qr_id,
            qrLink: orderData.qr_link
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء الإرسال',
            error: error.message
        });
    }
};

export default sendToWaseet;


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
      
          res.render('allOrders', {
            orders: rows,}); 
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



export { createOrder, getAllOrders, getOrderById,updateOrderStatus, deleteOrder,getCreateOrder,sendToWaseet};