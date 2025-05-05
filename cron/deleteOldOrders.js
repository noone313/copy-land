import cron from "node-cron";
import { Op } from "sequelize";
import { Order } from "../models/models.js";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../utils/s3Client.js";

// دالة حذف الصور القديمة من S3
const deleteOldImagesFromS3 = async () => {
  try {
    const bucketName = process.env.S3_BUCKET;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    let deletedCount = 0;
    let totalScanned = 0;
    let isTruncated = true;
    let continuationToken = null;

    console.log(`⏳ بدء حذف الصور القديمة من S3...`);

    while (isTruncated) {
      const listParams = { Bucket: bucketName, ContinuationToken: continuationToken };
      const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));
      const objects = listResponse.Contents || [];
      totalScanned += objects.length;

      const oldObjects = objects.filter(object => 
        object.LastModified < oneMinuteAgo
      );

      if (oldObjects.length > 0) {
        await Promise.all(oldObjects.map(async (object) => {
          try {
            await s3Client.send(new DeleteObjectCommand({
              Bucket: bucketName,
              Key: object.Key,
            }));
            console.log(`✅ S3: تم حذف ${object.Key}`);
            deletedCount++;
          } catch (error) {
            console.error(`❌ S3: فشل حذف ${object.Key} - ${error.message}`);
          }
        }));
      }

      isTruncated = listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
    }

    console.log(deletedCount > 0 
      ? `✅ S3: تم حذف ${deletedCount}/${totalScanned} صورة` 
      : `ℹ️ S3: لا توجد صور قديمة (${totalScanned} مفحوصة)`);
      
    return { s3Deleted: deletedCount, s3Scanned: totalScanned };
  } catch (error) {
    console.error("❌ S3: خطأ عام:", error);
    throw error;
  }
};

// دالة حذف الطلبات القديمة من قاعدة البيانات
const deleteOldOrdersFromDB = async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const deletedCount = await Order.destroy({
      where: { 
        created_at: { 
          [Op.lt]: oneMinuteAgo 
        } 
      },
    });

    console.log(deletedCount > 0 
      ? `✅ DB: تم حذف ${deletedCount} طلب` 
      : `ℹ️ DB: لا توجد طلبات قديمة`);
      
    return { dbDeleted: deletedCount };
  } catch (error) {
    console.error("❌ DB: خطأ في حذف الطلبات:", error);
    throw error;
  }
};

// دالة رئيسية تنسق بين العمليتين
const cleanupOldResources = async () => {
  try {
    console.log('--- بدء عملية التنظيف ---');
    
    // تشغيل العمليتين بالتزامن مع التعامل المنفصل للأخطاء
    const [s3Result, dbResult] = await Promise.allSettled([
      deleteOldImagesFromS3(),
      deleteOldOrdersFromDB()
    ]);

    // معالجة النتائج
    const results = {
      s3: s3Result.status === 'fulfilled' ? s3Result.value : { error: s3Result.reason },
      db: dbResult.status === 'fulfilled' ? dbResult.value : { error: dbResult.reason }
    };

    console.log('--- نتائج التنظيف ---');
    console.log(JSON.stringify(results, null, 2));
    console.log('--- اكتملت العملية ---\n');

    return results;
  } catch (error) {
    console.error("❌ خطأ في العملية الرئيسية:", error);
    throw error;
  }
};

// جدولة المهمة كل دقيقة
cron.schedule("* * * * *", () => {
  cleanupOldResources()
    .catch(error => console.error('❌ فشل الجدولة:', error));
});

