const monthObj = {
    "monthName": "",
    "year": "",
    "monthNumber": "",
    "numberOfDays": "",
    "bookingArray": []
}

const dataBaseName = "hotel-booking";

const collections = {
    rooms: "rooms",
    months: "months",
    persons: "persons",
    bookings: "bookings"
}

const mongoUrl = "mongodb://localhost:27017/" + dataBaseName;

module.exports = { monthObj, dataBaseName, collections, mongoUrl };