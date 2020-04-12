import React, {useEffect, useState}from 'react';
import {MDBRow, MDBCol, MDBListGroup, MDBListGroupItem,
  MDBBtn, MDBModal, MDBModalHeader, MDBModalBody,
  MDBModalFooter, MDBIcon} from 'mdbreact'
import axios from 'axios';
import {BASE_URL} from '../../settings.js';
import './Room.css'

const Room = (props) => {
    const [userId, setUserId] = useState("")
    const [roomId, setRoomId] = useState("")

    useEffect(()=> {
        setUserId(props.userId)
        setRoomId(props.roomId)
    }, [props.userId, props.roomId]);

    const [currentQuestionText, setCurrentQuestionText] = useState("what is the capital of alberta?")
    const [users, setUsers] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);

    const [showAnswerModal, setShowAnswerModal]= useState(false);
    const [answer, setAnswer] = useState("")
    const [finalAnswer, setFinalAnswer] = useState("")

    useEffect(()=> {
        let allUsers = [...users];
        allUsers.push(userId)
        setUsers(allUsers)
    }, [userId])

    const answerHandler = () => {
      console.log(showAnswerModal)
      if (!showAnswerModal) {
        setShowAnswerModal(true)
        return
      }
      setFinalAnswer(answer)
      setShowAnswerModal(false)
    }

    useEffect(()=> {
      if (roomId == "") {
        return
      }
      let questionUrl = `${BASE_URL}/room/${roomId}/questions/${props.currentQuestionId}`
      axios.get(questionUrl)
      .then(res => {
        let questionName = res.data.name
        setCurrentQuestionText(questionName)
      })
    }, [roomId, props.currentQuestionId])


    useEffect(()=> {
      props.sendAnswerToServer(props.currentQuestionId, finalAnswer)
    }, [finalAnswer])


    // sort through the answers for the given question.
    useEffect(()=> {
      let allCurrentAnswersData = []
      allCurrentAnswersData = Object.keys(props.roomUserData).filter((user) => {
        if (props.currentQuestionId in props.roomUserData[user].answers){
          return true
        }
        return false
      }).map((user)=> {
        let userAnswer = props.roomUserData[user].answers[props.currentQuestionId]
        return {
          'name': user,
          ...userAnswer
        }
      }).sort((a, b) => {
        return a.time - b.time;
      })
      console.log(allCurrentAnswersData)
      setUserAnswers(allCurrentAnswersData)
    }, [props.roomUserData])

    const answerTextHandler = (event) => {
      setAnswer(event.target.value)
    }

    const isNotEmptyFinalAnswer = () => {
      return finalAnswer !== ""
    }
    const isNotEmptyAnswer = () => {
      return answer !== ""
    }

    return <div className="room-page">
      <MDBRow>
        <MDBCol md="12">
          <p className="h4 text-center mb-4">Join Room! Code: {roomId}</p>
        </MDBCol>
      </MDBRow>
      <MDBRow>
        <MDBCol md="6">
          <p className="text-center mb-4">Question</p>
          <p className="h4 text-center mb-4">{currentQuestionText}</p>
          <div className="text-center mt-4">
            <MDBBtn color="green" onClick={answerHandler}>I know the Answer!</MDBBtn>
          </div>
          <br/>
          <br/>
        </MDBCol>
        <MDBCol md="6">
          <p className="text-center mb-4">Answers</p>
          {isNotEmptyFinalAnswer() && 
             <p className="h4 text-center mb-4">your answer: {finalAnswer}</p>
          }
          {userAnswers.length !== 0 ?
              <MDBListGroup className="room-users" >
                {userAnswers.map((user)=> {
                    return <MDBListGroupItem key={user.name}>
                      <span>{user.name}</span>
                      {user.is_correct?
                        <MDBIcon className="green-text" icon="check" />
                        :
                        <MDBIcon className="red-text" icon="times" />
                      }
                    </MDBListGroupItem>
                })}
              </MDBListGroup>
              :
              <p>No {isNotEmptyFinalAnswer() && <span>other</span>} answers yet</p>
          }
          <br/>
          <br/>
        </MDBCol>
      </MDBRow>

      <MDBRow>
        <MDBCol md="6">
          <p className="text-center mb-4">Scoreboard ({Object.keys(props.roomUserData).length} users active)</p>
          <div className="room-user-list">
              <MDBListGroup className="room-users" >
                {Object.keys(props.roomUserData).sort((user_a, user_b) => {
                  return props.roomUserData[user_b].points - props.roomUserData[user_a].points;
                }).map((user, i)=> {
                    return <MDBListGroupItem key={i}>
                    {user}, score: {props.roomUserData[user].points.toString()}
                    </MDBListGroupItem>
                })}
              </MDBListGroup>
          </div>
        </MDBCol>
      </MDBRow>
      <MDBModal isOpen={showAnswerModal} toggle={showAnswerModal}>
        <MDBModalHeader>Enter Answer Below</MDBModalHeader>
        <MDBModalBody>
          <input
            autoFocus={showAnswerModal}
            type="text"
            id="defaultUserAnswer"
            className="form-control"
            onChange={answerTextHandler}
            value={answer}/>
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color="secondary" onClick={()=> {setShowAnswerModal(false)}}>Close</MDBBtn>
          <MDBBtn color="green" onClick={answerHandler}>Enter Answer</MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </div>
}

export default Room;