import colors from 'colors';
import mongoose from 'mongoose';
import { DB_URI } from './constants';

const connectMongoDB = async () => {
  const { connection } = await mongoose.connect(DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  console.log(colors.cyan.bold('MongoDB Connected: %s'), connection.host);
};

export default connectMongoDB;
