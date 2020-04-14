import React, {useRef, useEffect, useState, useCallback} from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import Room from '../../components/Room/Room.js';
import {BASE_URL, WS_BASE_URL} from "../../settings.js";
import { browserHistory } from 'react-router';

const USER_JOIN_ACTION = "user_join";
const ANSWER_QUESTION_ACTION = "answer_question";
const NEW_QUESTION_ACTION = "new_question";
const FIRST_TO_ANSWER_ACTION = "first_to_answer";

const RoomPage = (props) => {
    const ws = useRef(null);
    const [roomUserData, setRoomUserData] = useState({})
    const [currentQuestionId, setCurrentQuestionId] = useState()
    const [newQuestionId, setNewQuestionId] = useState()
    const [firstToAnswer, setFirstToAnswer] = useState()
    const [messages, setMessages] = useState([])
    const addNewMessage = useCallback(() => {
        setMessages([...messages])
    },
    [, messages]);

    let { roomId } = useParams();
    let { userId } = useParams();

    useEffect(() => {
        openAndListenToWebSocket();
        setInitialRoomData();
        return () => {
            closeWebSocket()
        };
    }, []);

    const openAndListenToWebSocket = () => {
      ws.current = new WebSocket(`${WS_BASE_URL}/questions_notifications/${roomId}/`);
      ws.current.onopen = () => {
          ws.current.send(JSON.stringify({
              'type': USER_JOIN_ACTION,
              'user': userId,
              'message': "Joined Room",
          }));
      };
      ws.current.onclose = () => console.log("ws closed");

      ws.current.onmessage = function(e) {
          const newMessage = JSON.parse(e.data);
          let allMessages = messages;
          messages.push(newMessage)
          addNewMessage(messages)
      };

      ws.current.onclose = function(e) {
          console.error('Chat socket closed unexpectedly');
      };
    }

    const closeWebSocket = () => {
      ws.current.close();
    }

    const cannotSendWebsocketMessage = () => {
      if (roomUserData === {}) {
        return false;
      }
      return (!ws.current || userId === "");
    }

    const sendAnswer = (question, answer) => {
      if (cannotSendWebsocketMessage()){
        return
      }
      ws.current.send(JSON.stringify({
          'type': ANSWER_QUESTION_ACTION,
          'user': userId,
          'message': {
            'question': question,
            'answer': answer,
          }
      }));
    }

    const sendGetNewQuestion = (question) => {
      if (cannotSendWebsocketMessage()){
        return
      }
      if (roomUserData === {}) {
        return
      }
      setFirstToAnswer()
      ws.current.send(JSON.stringify({
          'type': NEW_QUESTION_ACTION,
          'user': userId,
          'message': {
            'new_question': question
          }
      }));
    }

    // handle the last message
    useEffect(()=> {
      let lastMessage = messages[messages.length - 1];
      handleLastMessageUpdate(lastMessage)
    }, [messages])

    // debug purposes
    useEffect(()=> {
      console.log("roomUserData")
      console.log(roomUserData)
    }, [roomUserData])

    const handleLastMessageUpdate = (payload) => {
      if (!payload || !payload.hasOwnProperty("action")) {
        return
      }
      console.log("handleLastMessageUpdate");
      console.log(payload)
      switch(payload.action) {
        case USER_JOIN_ACTION:
          handleUserJoin(payload)
          break;
        case ANSWER_QUESTION_ACTION:
          handleUserAnswerQuestion(payload);
          break;
        case NEW_QUESTION_ACTION:
          handleNewQuestion(payload);
          break;
        default:
          console.log("unhandled message")
      }
    }

    const handleUserAnswerQuestion = (payload) => {
      const user = payload.user
      const answerMessage = payload.message
      const questionId = payload.message.question

      setFirstToAnswer(payload.message.first_to_answer)
      setNewQuestionId(payload.message.next_question)

      let currentRoomUserData = {...roomUserData}
      Object.keys(currentRoomUserData).forEach((user, i)=> {
         // check if anyone has answered before.
        if (currentRoomUserData[user].answers.hasOwnProperty(questionId)) {
          return;
        }
        if (user !== payload.user){
          return;
        }
        let answerPayload = {
          answer: payload.message.answer,
          is_correct: payload.message.is_correct,
          value: payload.message.value,
          time: payload.time
        }
        if (payload.message.is_correct) {
          currentRoomUserData[user].points += payload.message.value
        }
        currentRoomUserData[user].answers[questionId] = answerPayload;
      });
      setRoomUserData(currentRoomUserData)
    }

    const handleUserJoin = (payload) => {
      if (payload !== undefined){
        setCurrentQuestionId(payload.message.current_question)
      }
      setInitialRoomData();
    }

    const setInitialRoomData = () => {
      let roomUserDataUrl  = `${BASE_URL}/room/${roomId}/users/`
      // console.log(payload)
      axios.get(roomUserDataUrl)
      .then(res => {
        let currentUsers = {...roomUserData}
        res.data.map((user)=>{
          let name = user.name;
          if (!roomUserData.hasOwnProperty(name)) {
            currentUsers[`${name}`] = {
              points: 0,
              answers: {}
            };
          }
        })
        setRoomUserData(currentUsers)
      });
    }

    const handleNewQuestion = (payload) => {
      console.log("handleNewQuestion")
      console.log(payload.message.question)
      setFirstToAnswer(undefined)
      setCurrentQuestionId(payload.message.question)
    }

    return <div>
      <Room
        userId={userId}
        roomId={roomId}
        roomUserData={roomUserData}
        sendAnswerToServer={sendAnswer}
        sendGetNewQuestion={() => sendGetNewQuestion(newQuestionId)}
        firstToAnswer={firstToAnswer}
        currentQuestionId={currentQuestionId}/>
    </div>
}

export default RoomPage;
