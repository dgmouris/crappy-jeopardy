import React, {useEffect, useState}from 'react';
import {MDBRow, MDBCol, MDBListGroup, MDBListGroupItem,
  MDBBtn, MDBModal, MDBModalHeader, MDBModalBody,
  MDBModalFooter, MDBIcon, MDBCard, MDBCardBody,
  MDBCardTitle} from 'mdbreact' 
import axios from 'axios';
import {BASE_URL} from '../../settings.js';
import './Room.scss'

const Room = (props) => {
    const [userId, setUserId] = useState("")
    const [roomId, setRoomId] = useState("")

    useEffect(()=> {
        setUserId(props.userId)
        setRoomId(props.roomId)
    }, [props.userId, props.roomId]);

    const [currentQuestionText, setCurrentQuestionText] = useState("Loading...")
    const [currentAnswerText, setCurrentAnswerQuestionText] = useState("")
    const [currentQuestionValue, setCurrentQuestionValue ] = useState("");

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
      if (roomId == "" || props.currentQuestionId === undefined) {
        return
      }
      resetRoomQuestion()
      let questionUrl = `${BASE_URL}/room/${roomId}/questions/${props.currentQuestionId}`
      axios.get(questionUrl)
      .then(res => {
        let questionName = res.data.name;
        let value = res.data.value;
        console.log("res.data")
        console.log(res.data)
        setCurrentQuestionText(questionName)
        setCurrentQuestionValue(value)
      })

    }, [roomId, props.currentQuestionId])

    const resetRoomQuestion = () => {
      setUserAnswers([])
      setAnswer("")
      setCurrentAnswerQuestionText("")
      setCurrentQuestionValue("")
      setFinalAnswer("")
    }

    useEffect(()=> {
      if (finalAnswer === ""){
        return
      }
      props.sendAnswerToServer(props.currentQuestionId, finalAnswer)
    }, [finalAnswer]);

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
        // The actual answer is in the payload.
        setCurrentAnswerQuestionText(
          props.roomUserData[user].answers[props.currentQuestionId].actual_answer
        );
        return {
          'name': user,
          ...userAnswer
        }
      }).sort((answer_a, answer_b) => {
        return answer_a.time - answer_b.time;
      })
      console.log(allCurrentAnswersData)
      setUserAnswers(allCurrentAnswersData)
    }, [props.roomUserData])

    const answerTextHandler = (event) => {
      setAnswer(event.target.value)
    }

    const nextQuestionHandler = (event) => {
      props.sendGetNewQuestion()
    }

    const isNotEmptyFinalAnswer = () => {
      return finalAnswer !== ""
    }
    const isNotEmptyAnswer = () => {
      return answer !== ""
    }

    const isFirstToAnswer = ()=> {
      return userId === props.firstToAnswer;
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

          <MDBCard>
            <MDBCardBody className="cj_question_card">
              <MDBCardTitle >
              <span className="cj_question_card_value text-center">
                {(currentQuestionValue !== "")&& 
                  <React.Fragment>For ${currentQuestionValue}</React.Fragment>
                }
              </span>
              <span className="cj_question_card_text">{currentQuestionText}</span></MDBCardTitle>
            </MDBCardBody>
          </MDBCard>

          <div className="text-center mt-4">
            <MDBBtn color="green" onClick={answerHandler} disabled={finalAnswer!==""}>I know the Answer!</MDBBtn>
          </div>
          <div className="text-center mt-4">
            <MDBBtn color="light-blue"
              onClick={nextQuestionHandler}
              disabled={!isFirstToAnswer()}
              >Next Question</MDBBtn>
            {isFirstToAnswer() ?
              <p>Click for next quesiton!</p>
              :
              <React.Fragment>
              { props.firstToAnswer !== undefined ?
                <p>Waiting on {props.firstToAnswer} for new quesiton</p>
                :
                <p>Waiting on user answers...</p>
              }
              </React.Fragment>
            }
          </div>
          <br/>
          <br/>
        </MDBCol>
        <MDBCol md="6">
          <p className="text-center mb-4">Answers</p>
          {isNotEmptyFinalAnswer() &&
             <React.Fragment>
               <p className="h4 text-center mb-4">your answer: {finalAnswer}</p>
               <p className="h4 text-center mb-4">The actual answer: {currentAnswerText}</p>
             </React.Fragment>
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
              <p className="text-center">No {isNotEmptyFinalAnswer() && <span>other</span>} answers yet</p>
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