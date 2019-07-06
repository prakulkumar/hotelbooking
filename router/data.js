module.exports = {
    roomsArrayPromise: async (dbs, collectionName) => {
        return await dbs.collection(collectionName).find({}).toArray();
    },
    monthsDetailPromise: async (dbs, collectionName, obj) => {
        return await dbs.collection(collectionName).find(obj).toArray();
    },
    addDataPromise: async (dbs, collectionName, obj) => {
        return await dbs.collection(collectionName).insertOne(obj);
    },
    findOnePromise: async (dbs, collectionName, obj) => {
        return await dbs.collection(collectionName).findOne(obj);
    },
    updateDataPromise: async (dbs, collectionName, query, newValue) => {
        return await dbs.collection(collectionName).updateOne(query, newValue);
    }
}