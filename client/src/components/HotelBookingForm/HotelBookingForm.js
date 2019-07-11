import React, { Component } from 'react';

import { Button, Modal, Form, Col } from 'react-bootstrap';
import DatePicker from "react-datepicker";

import './HotelBookingForm.css';
import "react-datepicker/dist/react-datepicker.css";

import dateFNS from 'date-fns';
import axios from 'axios';

const roomTypes = ['AC', 'Non AC', 'Deluxe', 'Suite', 'Dormitory'];

class HotelBookingForm extends Component {
    state = {
        validated: false,
        hotelBookingForm: {
            step: 1,
            firstName: '',
            lastName: '',
            address: '',
            dateOfArrival: '',
            dateOfDeparture: '',
            noOfAdults: '',
            noOfChildren: 0,
            noOfNights: 0,
            rooms: []
        },
        availableRooms: [],
        formIsValid: true,
        isEdit: false,
        bookingId: null,
        personId: null,
        disable: false,
        misc: '',
        total: '',
        balance: '',
        status: '',
        modalHeader: 'Booking Details',
        previousDepartureDate: '',
        previousArrivalDate: ''
    }

    componentDidMount() {
        if (this.props.showModal) {
            let disable = false;
            if (this.props.status === 'viewBooking') {
                disable = true
            }
            let updatedForm = { ...this.state.hotelBookingForm };
            updatedForm.dateOfArrival = this.props.detailsForForm.date;
            this.setState({ hotelBookingForm: updatedForm, disable, status: this.props.status });
            if (!this.props.detailsForForm.available) {
                axios.get(`/getBookingDetails/${this.props.detailsForForm.bookingId}`)
                    .then(res => {
                        let data = res.data;
                        console.log('response booking data : ', data);
                        let form = {
                            step: 1,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            address: data.address,
                            dateOfArrival: new Date(data.checkIn),
                            dateOfDeparture: new Date(data.checkOut),
                            noOfAdults: data.adults,
                            noOfChildren: data.children,
                            rooms: data.rooms
                        }
                        this.setState({
                            hotelBookingForm: form,
                            bookingId: data.bookingId,
                            personId: data.personId,
                            misc: data.misc,
                            balance: data.balance,
                            previousDepartureDate: data.checkOut,
                            previousArrivalDate: data.checkIn
                        });
                        this.getAvailableRooms(new Date(data.checkOut));
                    })
                    .catch(error => console.log(error))
            }
        }
        console.log('booking data : ', new Date());
    }

    nextStep = () => {
        const updatedForm = { ...this.state.hotelBookingForm }
        updatedForm.step += 1;
        this.setState({ hotelBookingForm: updatedForm })
    }

    prevStep = () => {
        const updatedForm = { ...this.state.hotelBookingForm }
        updatedForm.step -= 1;
        this.setState({ hotelBookingForm: updatedForm })
    }

    getPersonDetailsForm = () => (
        <React.Fragment>
            <Form.Row>
                <Form.Group as={Col} controlId="formPlaintext">
                    <Form.Control
                        title="First Name"
                        type="text"
                        placeholder="First Name"
                        value={this.state.hotelBookingForm.firstName}
                        name="firstName"
                        onChange={(event) => this.inputChangedHandler(event)}
                        disabled={!this.state.isEdit && this.state.disable}
                        className="valueCapitalize"
                        required />
                    <span className="required">*</span>
                </Form.Group>
                <Form.Group as={Col} controlId="formPlaintext">
                    <Form.Control
                        title="Last Name"
                        type="text"
                        placeholder="Last Name"
                        value={this.state.hotelBookingForm.lastName}
                        name="lastName"
                        className="valueCapitalize"
                        onChange={(event) => this.inputChangedHandler(event)}
                        disabled={!this.state.isEdit && this.state.disable}
                        required />
                    <span className="required">*</span>
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col} controlId="formPlaintextarea">
                    <Form.Control
                        title="Address"
                        as="textarea"
                        rows="3"
                        placeholder="Address"
                        value={this.state.hotelBookingForm.address}
                        name="address"
                        onChange={(event) => this.inputChangedHandler(event)}
                        disabled={!this.state.isEdit && this.state.disable}
                        required />
                    <span className="required">*</span>
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col} controlId="formPlainCalendar">
                    <DatePicker
                        title="Date Of Arrival"
                        selected={this.state.hotelBookingForm.dateOfArrival}
                        onSelect={(event) => this.inputChangedHandler({ event, name: "dateOfArrival", isDate: true })}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Date of Arrival"
                        minDate={new Date()}
                        key="dateofArrival"
                        className="form-control"
                        disabled={!this.state.isEdit && this.state.disable}
                        required
                    />
                    <span className="required">*</span>
                </Form.Group>
                <Form.Group as={Col} controlId="formPlaintCalendar">
                    <DatePicker
                        title="Date Of Departure"
                        selected={this.state.hotelBookingForm.dateOfDeparture}
                        onSelect={(event) => this.inputChangedHandler({ event, name: "dateOfDeparture", isDate: true })}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Date of Departure"
                        minDate={this.state.hotelBookingForm.dateOfArrival}
                        key="dateOfDeparture"
                        className="form-control"
                        excludeDates={[new Date("07-15-2019"), new Date("07-20-2019"), new Date("07-21-2019"), new Date("07-25-2019")]}
                        disabled={!this.state.isEdit && this.state.disable}
                        required
                    />
                    <span className="required">*</span>
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col} controlId="formPlainNumber">
                    <Form.Control
                        title="Adults"
                        type="number"
                        placeholder="Adults"
                        value={this.state.hotelBookingForm.noOfAdults}
                        name="noOfAdults"
                        onChange={(event) => this.inputChangedHandler(event)}
                        disabled={!this.state.isEdit && this.state.disable}
                        min="0"
                        required />
                    <span className="required">*</span>
                </Form.Group>
                <Form.Group as={Col} controlId="formPlainNumber">
                    <Form.Control
                        title="Children"
                        type="number"
                        placeholder="Children"
                        value={this.state.hotelBookingForm.noOfChildren}
                        name="noOfChildren"
                        onChange={(event) => this.inputChangedHandler(event)}
                        disabled={!this.state.isEdit && this.state.disable}
                        min="0"
                        required />
                    <span className="required">*</span>
                </Form.Group>
                <Form.Group as={Col} controlId="formPlainNumber">
                    <Form.Control
                        title="Nights"
                        type="number"
                        placeholder="Nights"
                        name="noOfNights"
                        value={this.state.hotelBookingForm.dateOfDeparture ? dateFNS.differenceInCalendarDays(this.state.hotelBookingForm.dateOfDeparture, this.state.hotelBookingForm.dateOfArrival) : 0}
                        min="0"
                        readOnly
                        required />
                    <span className="required">*</span>
                </Form.Group>
            </Form.Row>
        </React.Fragment>
    )

    getRoomDetailsForm = () => (
        <React.Fragment>
            <Form.Row>
                <Form.Group>
                    <Button variant="primary" type="button" onClick={this.addRoom}
                        disabled={!this.state.isEdit && this.state.disable}>
                        Add Room
                        </Button>
                </Form.Group>
            </Form.Row>
            <div className="roomDetailsForm">
                {
                    this.state.hotelBookingForm.rooms.map((room, index) => {
                        return (
                            <Form.Row key={index}>
                                <Form.Group as={Col} md="5" controlId="formPlainSelect">
                                    <Form.Control
                                        as="select" title="Room Type"
                                        value={this.state.hotelBookingForm.rooms[index].roomType}
                                        name="roomType"
                                        onChange={(event) => this.roomDetailsChangedHandler(event, "roomType", index)}
                                        disabled={!this.state.isEdit && this.state.disable}
                                        required >
                                        <option value='' hidden>Room Type</option>
                                        {roomTypes.map((roomType, i) => {
                                            return <option key={`roomType${i}`}>{roomType}</option>
                                        })}
                                    </Form.Control>
                                    <span className="required">*</span>
                                </Form.Group>
                                <Form.Group as={Col} md="5" controlId="formPlainSelect">
                                    <Form.Control
                                        as="select" title="Room No"
                                        value={this.state.hotelBookingForm.rooms[index].roomNumber}
                                        name="roomNo"
                                        onChange={(event) => this.roomDetailsChangedHandler(event, "roomNumber", index)}
                                        disabled={!this.state.isEdit && this.state.disable}
                                        required >
                                        <option value='' hidden>Room No</option>
                                        {this.state.availableRooms.map((room, i) => {
                                            if (room.roomType === this.state.hotelBookingForm.rooms[index].roomType) {
                                                return <option key={`roomNo${i}`}>{room.roomNumber}</option>
                                            }
                                            return null;
                                        })}
                                    </Form.Control>
                                    <span className="required">*</span>
                                </Form.Group>
                                {index === 0 ? null : (
                                    <Form.Group as={Col} md="2" className="icon">
                                        <i
                                            className="fa fa-trash-o pointerCursor"
                                            style={{ fontSize: "20px" }}
                                            onClick={() => this.deleteRoom(index)}
                                            title="Delete">
                                        </i>
                                    </Form.Group>
                                )}
                            </Form.Row>
                        )
                    })
                }
            </div>
        </React.Fragment>
    )

    getAmountDetails = () => {
        return (
            <React.Fragment>
                <div className="separator"></div>
                <div>
                    <div className="amountDetails" >
                        <p>Total:</p><p>10000</p>
                    </div>
                    <div className="amountDetails">
                        <p>Advance:</p><p>3000</p>
                    </div>
                    <div className="amountDetails">
                        <p>Misc:</p><p>{this.state.misc}</p>
                    </div>
                    <div className="amountDetails">
                        <p>Balance:</p><p>{this.state.balance}</p>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    checkMonth = (date) => {
        const dateObj = {
            dateOfArrival: this.state.hotelBookingForm.dateOfArrival,
            dateOfDeparture: date
        };
        axios.post('/createBulkMonthObj', dateObj)
            .then(res => {
                if (res.status === 200 && res.data === 'done') {
                    this.getAvailableRooms(date);
                }
            })
            .catch(error => console.log(error))
    }

    getAvailableRooms = (date) => {
        const monthDetail = {
            year: dateFNS.getYear(this.props.detailsForForm.date),
            arrival: {
                date: this.props.detailsForForm.date,
                month: dateFNS.getMonth(this.props.detailsForForm.date)
            },
            departure: {
                date: date,
                month: dateFNS.getMonth(date)
            }
        }
        axios.post('/getAvailableRooms', monthDetail)
            .then(res => {
                let data = res.data;
                let rooms = [...this.state.hotelBookingForm.rooms];
                this.setState({ availableRooms: data.concat(rooms) });
                if (this.state.hotelBookingForm.rooms.length === 0) { this.setDefaultRoom(date) };
            }).catch(error => console.log(error));
    }

    setDefaultRoom = (departureDate) => {
        let tempObj;
        let room = this.state.availableRooms.filter(room => room.roomNumber === this.props.detailsForForm.roomNumber);
        room.length > 0 ? tempObj = room[0] : tempObj = this.state.availableRooms[0];
        let updatedForm = { ...this.state.hotelBookingForm };
        let updatedRooms = [...updatedForm.rooms];
        updatedRooms.push({
            roomType: tempObj.roomType,
            roomNumber: tempObj.roomNumber
        })
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    inputChangedHandler = (event) => {
        let updatedForm = { ...this.state.hotelBookingForm };
        if (event.isDate) {
            updatedForm[event.name] = event.event;
            this.setState({ hotelBookingForm: updatedForm });
            if (event.name === 'dateOfArrival') {
                updatedForm['dateOfDeparture'] = '';
                this.setState({ hotelBookingForm: updatedForm });
            }

            if (event.name === 'dateOfDeparture') this.checkMonth(event.event);
        }
        else {
            updatedForm[event.target.name] = event.target.name === 'firstName' || event.target.name === 'lastName' ? event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1) : event.target.value;
            if (event.target.name === 'noOfRooms') {
                updatedForm['rooms'] = new Array(Number(event.target.value)).fill({});
            }
            this.setState({ hotelBookingForm: updatedForm });
        }
    }

    roomDetailsChangedHandler = (event, name, index) => {
        let updatedForm = { ...this.state.hotelBookingForm };
        let updatedRooms = [...updatedForm.rooms];
        updatedRooms[index] = {
            ...updatedRooms[index],
            [name]: event.target.value
        }
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    checkValidity = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity()) {
            this.nextStep();
        }
        this.setState({ validated: true });
    }

    hotelBookedHandler = (event) => {
        event.preventDefault();
        let bookingData = {};
        for (let element in this.state.hotelBookingForm) {
            bookingData[element] = this.state.hotelBookingForm[element];
        }
        console.log(bookingData);

        let url = '';
        if (this.state.isEdit && this.state.disable) {
            console.log('update');
            url = '/updateBookingDetails';
            bookingData['personId'] = this.state.personId;
            bookingData['bookingId'] = this.state.bookingId;
            bookingData['previousDepartureDate'] = this.state.previousDepartureDate;
            bookingData['previousArrivalDate'] = this.state.previousArrivalDate;
        }
        else { console.log('newbooking'); url = '/addBookingDetails' }

        console.log('booking data : ', bookingData);

        axios.post(url, bookingData)
            .then(res => {
                console.log(res.data);
                if (res.status === 200) this.props.handleBookings();
            }).catch(error => {
                console.log(error);
            });
        this.props.onClose();

    }

    showModalHandler = () => {
        this.setState({ showModal: true });
    }

    closeModalHandler = () => {
        this.setState({ validated: false });
        this.clearForm();
        this.props.onClose();
    }

    clearForm = () => {
        let updatedForm = { ...this.state.hotelBookingForm };
        for (let element in updatedForm) {
            let updatedFormElement = { ...updatedForm[element] }
            if (element === 'rooms') {
                updatedFormElement = [];
            } else {
                updatedFormElement = '';
            }
            updatedForm[element] = updatedFormElement;
        }
        this.setState({ hotelBookingForm: updatedForm });
    }

    addRoom = () => {
        let updatedForm = { ...this.state.hotelBookingForm };
        let updatedRooms = [...updatedForm.rooms]
        updatedRooms.push({});
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    deleteRoom = (index) => {
        console.log(index)
        let updatedForm = { ...this.state.hotelBookingForm };
        let rooms = [...updatedForm.rooms]
        let updatedRooms = rooms.filter((room, i) => i !== index);
        updatedForm.rooms = updatedRooms;
        console.log(updatedRooms)
        this.setState({ hotelBookingForm: updatedForm });
    }

    edit = () => {
        console.log(true);
        this.setState({ isEdit: true, status: 'editBooking' });
    }

    render() {
        const { step } = this.state.hotelBookingForm;
        let currentStepForm = null;
        let modalTitle = null;
        switch (step) {
            case 1:
                modalTitle = <Modal.Title>Booking Details</Modal.Title>;
                currentStepForm = this.getPersonDetailsForm();
                break;
            case 2:
                modalTitle = <Modal.Title>Room Details</Modal.Title>;
                currentStepForm = this.getRoomDetailsForm();
                break;
            case 3:
                modalTitle = <Modal.Title>Amount Details</Modal.Title>;
                currentStepForm = this.getAmountDetails();
                break;

            default:
                modalTitle = <Modal.Title>Booking Details</Modal.Title>;
                currentStepForm = this.getPersonDetailsForm();
        }

        let footer = null;
        let editButton = null;
        switch (this.state.status) {
            case 'newBooking':
                editButton = null;
                footer = (
                    <Modal.Footer style={{ marginTop: '2%' }}>
                        {this.state.hotelBookingForm.step === 1 ?
                            <Button variant="primary" type="submit"
                                disabled={this.state.hotelBookingForm.dateOfDeparture === ''}>Next</Button> : null}
                        {this.state.hotelBookingForm.step === 2 ?
                            (<React.Fragment>
                                <Button variant="secondary" onClick={this.prevStep}>Previous</Button>
                                <Button variant="primary" onClick={(e) => this.hotelBookedHandler(e)}>Submit</Button>
                            </React.Fragment>) : null}
                    </Modal.Footer>
                )
                break;

            case 'viewBooking':
                editButton = (
                    <div className="editButton" title="Edit" onClick={this.edit}>
                        <i className="fa fa-pencil pointerCursor" style={{ fontSize: "18px" }}></i>
                    </div>
                );
                footer = (
                    <Modal.Footer style={{ marginTop: '2%' }}>
                        {this.state.hotelBookingForm.step === 1 ? null : <Button variant="secondary" onClick={this.prevStep}>Previous</Button>}
                        {this.state.hotelBookingForm.step < 3 ? <Button variant="primary" onClick={this.nextStep}>Next</Button> : null}
                    </Modal.Footer>
                )
                break;

            case 'editBooking':
                editButton = null;
                footer = (
                    <Modal.Footer style={{ marginTop: '2%' }}>
                        {this.state.hotelBookingForm.step === 1 ? null : <Button variant="secondary" onClick={this.prevStep}>Previous</Button>}
                        {this.state.hotelBookingForm.step < 3 ? <Button variant="primary" type="submit">Next</Button> : null}
                        {this.state.hotelBookingForm.step === 3 ? <Button variant="primary" onClick={(e) => this.hotelBookedHandler(e)}>Submit</Button> : null}
                    </Modal.Footer>
                )
                break;

            default: footer = null;
        }

        return (
            <React.Fragment>
                <Modal
                    show={this.props.showModal}
                    onHide={this.closeModalHandler}
                    centered>
                    <Modal.Header closeButton>
                        {modalTitle}
                        {editButton}
                    </Modal.Header>
                    <Modal.Body>
                        <Form noValidate validated={this.state.validated} onSubmit={(e) => this.checkValidity(e)}>
                            {currentStepForm}
                            {footer}
                        </Form>
                    </Modal.Body>
                </Modal>
            </React.Fragment>
        );
    }
}

export default HotelBookingForm;