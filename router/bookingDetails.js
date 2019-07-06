const express = require('express');
const router = new express.Router();
const dataBaseConnection = require('./dataBaseConnection');
const collections = require('../constant').collections;
const addDataPromise = require('./data').addDataPromise;
const findOnePromise = require('./data').findOnePromise;
const updateDataPromise = require('./data').updateDataPromise;
const dateFNS = require('date-fns');
const ObjectID = require('mongodb').ObjectID;

dataBaseConnection().then(dbs => {
    router.post('/addBookingDetails', async (req, res) => {
        try {
            console.log(req.body)
            const personObj = {
                "firstName": req.body.firstName,
                "lastName": req.body.lastName,
                "address": req.body.address,
                "adults": req.body.noOfAdults,
                "children": req.body.noOfChildren
            }

            const personResponse = await addDataPromise(dbs, collections.persons, personObj);
            const personId = personResponse.ops[0]._id;
            const dateArray = dateFNS.eachDay(req.body.dateOfArrival, req.body.dateOfDeparture);

            const bookingObj = {
                "personId": personId,
                "rooms": req.body.rooms,
                "checkIn": req.body.dateOfArrival,
                "checkOut": req.body.dateOfDeparture,
                "numberOfNights": req.body.noOfNights,
                "dateArray": dateArray,
                "advance": 0,
                "misc": [],
                "balance": 0
            }

            const bookingResponse = await addDataPromise(dbs, collections.bookings, bookingObj);
            const bookingId = bookingResponse.ops[0]._id;

            const diffrenceInMonth = dateFNS.differenceInCalendarMonths(req.body.dateOfDeparture, req.body.dateOfArrival);
            for (let index = 0; index <= diffrenceInMonth; index++) {
                const monthYearObj = correctMonthAndYear(dateFNS.getMonth(req.body.dateOfArrival) + index, dateFNS.getYear(req.body.dateOfArrival));
                await updateMonthObj(req, monthYearObj, bookingId, dateArray);
            }

            res.status(200).send('Booked Successfully');
        } catch (error) {
            console.log(error)
        }
    })

    updateMonthObj = async (req, monthYearObj, bookingId, dateArray) => {
        const roomsArray = [];
        req.body.rooms.forEach(room => {
            roomsArray.push({
                "roomNumber": room.roomNumber,
                "personName": req.body.firstName + ' ' + req.body.lastName,
                "bookingId": bookingId,
                "dates": dateArray.filter(date => dateFNS.getMonth(date) === monthYearObj.monthNumber)
            })
        });

        const monthObj = await findOnePromise(dbs, collections.months, monthYearObj);
        monthObj.bookingArray = [...monthObj.bookingArray, ...roomsArray];

        await updateDataPromise(dbs, collections.months, { _id: monthObj._id }, { $set: { bookingArray: monthObj.bookingArray } });
    }

    correctMonthAndYear = (monthNumber, year) => {
        if (monthNumber > 11) {
            return { monthNumber: monthNumber - 12, year: year + 1 };
        } else {
            return { monthNumber: monthNumber, year: year };
        }
    };

    router.post('/updateBookingDetails', async (req, res) => {
        try {
            const personObj = {
                "firstName": req.body.firstName,
                "lastName": req.body.lastName,
                "address": req.body.address,
                "adults": req.body.noOfAdults,
                "children": req.body.noOfChildren
            }

            const personId = new ObjectID(req.body.personId);

            await updateDataPromise(dbs, collections.persons, { _id: personId }, { $set: personObj });
            const dateArray = dateFNS.eachDay(req.body.dateOfArrival, req.body.dateOfDeparture);

            const bookingObj = {
                "personId": req.body.personId,
                "rooms": req.body.rooms,
                "checkIn": req.body.dateOfArrival,
                "checkOut": req.body.dateOfDeparture,
                "numberOfNights": req.body.noOfNights,
                "dateArray": dateArray,
                "advance": 0,
                "misc": [],
                "balance": 0
            }

            const bookingId = new ObjectID(req.body.bookingId);
            await updateDataPromise(dbs, collections.bookings, { _id: bookingId }, { $set: bookingObj });

            await deleteBookingDetails(req.body.previousArrivalDate, req.body.previousDepartureDate, bookingId);

            const diffrenceInMonth = dateFNS.differenceInCalendarMonths(req.body.dateOfDeparture, req.body.dateOfArrival);
            for (let index = 0; index <= diffrenceInMonth; index++) {
                const monthYearObj = correctMonthAndYear(dateFNS.getMonth(req.body.dateOfArrival) + index, dateFNS.getYear(req.body.dateOfArrival));
                await editMonthObj(req, monthYearObj, bookingId, dateArray);
            }

            res.status(200).send('Data Updated Successfully');
        } catch (error) {
            console.log(error)
        }
    })

    deleteBookingDetails = async (dateOfArrival, dateOfDeparture, bookingId) => {
        const diffrenceInMonth = dateFNS.differenceInCalendarMonths(dateOfDeparture, dateOfArrival);
        for (let index = 0; index <= diffrenceInMonth; index++) {
            const monthYearObj = correctMonthAndYear(dateFNS.getMonth(dateOfArrival) + index, dateFNS.getYear(dateOfArrival));
            const monthObj = await findOnePromise(dbs, collections.months, monthYearObj);
            const newArray = monthObj.bookingArray.filter(booking => !booking.bookingId.equals(bookingId));
            monthObj.bookingArray = [...newArray];
            await updateDataPromise(dbs, collections.months, { _id: monthObj._id }, { $set: { bookingArray: monthObj.bookingArray } });
        }
    }

    editMonthObj = async (req, monthYearObj, bookingId, dateArray) => {
        const roomsArray = [];
        req.body.rooms.forEach(room => {
            roomsArray.push({
                "roomNumber": room.roomNumber,
                "personName": req.body.firstName + ' ' + req.body.lastName,
                "bookingId": bookingId,
                "dates": dateArray.filter(date => dateFNS.getMonth(date) === monthYearObj.monthNumber)
            })
        });

        const monthObj = await findOnePromise(dbs, collections.months, monthYearObj);

        monthObj.bookingArray = [...roomsArray];

        await updateDataPromise(dbs, collections.months, { _id: monthObj._id }, { $set: { bookingArray: monthObj.bookingArray } });
    }

    router.get('/getBookingDetails/:id', async (req, res) => {
        try {
            const bookingObjectID = new ObjectID(req.params.id);
            const bookingObj = await findOnePromise(dbs, collections.bookings, { _id: bookingObjectID });
            const personObjectID = new ObjectID(bookingObj.personId);
            const personObj = await findOnePromise(dbs, collections.persons, { _id: personObjectID });
            bookingObj.bookingId = bookingObj._id;
            res.send({ ...bookingObj, ...personObj });
        } catch (error) {
            console.log(error);
        }
    })
});

module.exports = router;