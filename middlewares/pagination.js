const paginationMiddleware = (req, res, next) => {
    // القيم الافتراضية
    const defaultLimit = 10;
    const maxLimit = 100;
  
    // استخراج `page` و`limit` من query parameters
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
  
    // التأكد من أن `page` و`limit` أرقام صحيحة وصحيحة
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > maxLimit) limit = defaultLimit;
  
    // حساب `offset` (عدد السجلات التي يجب تخطيها)
    const offset = (page - 1) * limit;
  
    // إضافة الـ pagination إلى `req` لاستخدامها في الـ route
    req.pagination = {
      page,
      limit,
      offset,
    };
  
    next(); 
  };
  
export default paginationMiddleware;