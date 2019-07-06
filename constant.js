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

const mongoUrl = `mongodb+srv://prakul:mlab404@cluster0-jtu6n.gcp.mongodb.net/${dataBaseName}?retryWrites=true&w=majority`;

module.exports = { monthObj, dataBaseName, collections, mongoUrl };