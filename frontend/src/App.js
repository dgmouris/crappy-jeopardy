import React from 'react';
import {MDBContainer, MDBRow, MDBCol } from 'mdbreact';
import './App.css';
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
      <MDBRow>
        <MDBCol md="12">
          <p className="h4 text-center mb-4">Crappy Jeopardy</p>
        </MDBCol>
      </MDBRow>
      <MDBContainer>
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
