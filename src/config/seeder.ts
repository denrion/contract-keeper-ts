import colors from 'colors';
import 'dotenv/config';
import fs from 'fs';
import User from '../models/User';
import connectMongoDB from './connectMongoDB';

connectMongoDB();

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../__data__/users.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log(colors.green.inverse('Data successfuly imported'));
    process.exit();
  } catch (error) {
    console.error(colors.red(error));
  }
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await User.deleteMany({});
    console.log(colors.red.inverse('Data successfuly deleted'));
    process.exit();
  } catch (error) {
    console.error(colors.red(error));
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
