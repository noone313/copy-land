import { Sequelize,DataTypes, or } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URI);



const Order = sequelize.define("ORDER",{
id:{
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true,
  allowNull: false,
  unique: true,
  validate: {
    isNumeric: true,
  },
},
name:{
  type: DataTypes.STRING,
  allowNull: false,
  validate: {
    len: [1, 50],
  },
},
mobile:{
  type: DataTypes.STRING,
  allowNull:false,
  validate:{
    isNumeric:true,
    len:[11,11],
  }
},
city:{
  type: DataTypes.STRING,
  allowNull:false,
  validate:{
    len:[1,50],
  }
},
nearestPoint:{
  type: DataTypes.STRING,
  allowNull:false,
  validate:{
    len:[1,50],
  }
},
region:{
  type: DataTypes.STRING,
  allowNull:false,
  validate:{
    len:[1,50],
  }
},
note:{
  type: DataTypes.STRING,
  allowNull:true,
  validate:{
    len:[0,255],
  }
},
images: {
  type: DataTypes.ARRAY(DataTypes.STRING),
  allowNull: false,
  defaultValue: [],
  validate: {
    notEmpty: true,
    max(value) {
      if (value.length > 100) {
        throw new Error('Cannot upload more than 100 images');
      }
    }
  }
},

orderStatus:{
  type: DataTypes.ENUM("pending","in_progress","completed"),
  allowNull:false,
  defaultValue:"pending",
},


}, {
timestamps: true,
createdAt: "created_at",
updatedAt: "updated_at",
tableName: "orders",
});






const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log("✅ تم الاتصال بقاعدة البيانات");
  
      await sequelize.sync({ alter: true });
      console.log("🔄 تم تحديث الجداول تلقائيًا");
    } catch (error) {
      console.error("❌ خطأ فادح:", error);
      process.exit(1);
    }
  };




export { sequelize, startServer, Order };