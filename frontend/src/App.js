import React from 'react';
import {MDBContainer, MDBRow, MDBCol } from 'mdbreact';
import HomePage from './pages/Home/HomePage.js';
import RoomPage from './pages/Room/RoomPage.js';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <MDBRow className="cj-logo-container">
        <MDBCol md="4"></MDBCol>
        <MDBCol md="4">
            <img src="/logos/cj_logo_yellow.png" className="img-fluid" alt="crappy jeopardy logo"/>
        </MDBCol>
        <MDBCol md="4"></MDBCol>
      </MDBRow>
      <MDBContainer className="cj-view-container">
      <Router>
      <Switch>
        <Route
          path="/room/:roomId/user/:userId"
          render={({ match }) => {
            return <RoomPage />;
          }}
        />
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
       </Router>
      </MDBContainer>
    </div>
  );
}

export default App;
