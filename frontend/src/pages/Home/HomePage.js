import React, { useState } from 'react'
import { MDBRow, MDBCol, MDBBtn, MDBAlert} from 'mdbreact';
import { useHistory, Link } from "react-router-dom";
import {BASE_URL} from "../../settings.js";
import axios from 'axios';
import './HomePage.css'


const HomePage = (props) => {
  let history = useHistory();
  const [roomName, setRoomName] = useState("")
  const [userRoomName, setUserRoomName] = useState("")

  const [errors, setErrors] = useState("")

  const enterRoomHandler = (event) => {
    event.preventDefault();
    let newUserInRoomUrl = `${BASE_URL}/room/${roomName}/users/`
    // fetch(newUserInRoomUrl, {header})
    let roomData = {
      room: roomName,
      name: userRoomName
    }

    axios.post(newUserInRoomUrl, roomData)
      .then(res => {
        history.push(`/room/${roomName}/user/${userRoomName}`);
      }).catch(error => {
        if (error.response) {
          setErrors(`${error.response.data['non_field_errors']}`)
        } else {
          setErrors("error with the request.")
        }
      });
  }

  const userNameChangeHandler = (event) => {
    setUserRoomName(event.target.value)
  }

  const roomNameChangeHandler = (event) => {
    setRoomName(event.target.value);
  }

  return <div className="home-page">
    <form onSubmit={enterRoomHandler}>
      <MDBRow>
        <MDBCol md="3"></MDBCol>
        <MDBCol md="6">
          <label htmlFor="defaultRoomName" className="grey-text">
            Room name
          </label>
          <input
            type="text"
            id="defaultRoomName"
            className="form-control"
            onChange={roomNameChangeHandler}
            value={roomName}/>
          <br />
        </MDBCol>
        <MDBCol md="3"></MDBCol>
      </MDBRow>

      <MDBRow>
        <MDBCol md="3"></MDBCol>
        <MDBCol md="6">
            <label htmlFor="defaultUserName" className="grey-text">
              Your Name in the room
            </label>
            <input
              type="text"
              id="defaultUserName"
              className="form-control"
              onChange={userNameChangeHandler}
              value={userRoomName}/>
            <div className="text-center mt-4">
              <MDBBtn color="indigo" type="submit">Go into room and play</MDBBtn>
              <MDBBtn color="gray">View Room</MDBBtn>
            </div>
        </MDBCol>
      </MDBRow>
      {errors !== "" &&
      <MDBRow>
        <MDBCol md="3"></MDBCol>
        <MDBCol md="6">
          <MDBAlert color="danger" >
            {errors}<br/>
            <Link to={`/room/${roomName}/user/${userRoomName}`}>Click here and see if it works</Link>
          </MDBAlert>
        </MDBCol>
        <MDBCol md="3"></MDBCol>
      </MDBRow>}
    </form>
  </div>
}

export default HomePage;
