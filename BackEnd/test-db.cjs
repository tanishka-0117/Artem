const mongoose = require('mongoose');

const uri = 'mongodb+srv://thainuanatul_db_user:624QGc57GBTfKegV@cluster0.sgy2rpd.mongodb.net/Artem';

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB via SRV!');
    process.exit(0);
  })
  .catch(err => {
    console.error('SRV Connection Error:', err.message);
    
    // Fallback URI
    console.log('\nTrying direct connection string...');
    const directUri = 'mongodb://thainuanatul_db_user:624QGc57GBTfKegV@ac-xxllcbl-shard-00-00.sgy2rpd.mongodb.net:27017,ac-xxllcbl-shard-00-01.sgy2rpd.mongodb.net:27017,ac-xxllcbl-shard-00-02.sgy2rpd.mongodb.net:27017/Artem?ssl=true&authSource=admin&retryWrites=true&w=majority';
    
    mongoose.connect(directUri)
      .then(() => {
        console.log('Successfully connected to MongoDB via Direct String!');
        process.exit(0);
      })
      .catch(err2 => {
        console.error('Direct Connection Error:', err2.message);
        process.exit(1);
      });
  });
