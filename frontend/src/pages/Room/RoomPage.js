import React, {useRef, useEffect, useState, useCallback} from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import Room from '../../components/Room/Room.js';
import {BASE_URL} from "../../settings.js";
import { browserHistory } from 'react-router';

const USER_JOIN_ACTION = "user_join";
const ANSWER_QUESTION_ACTION = "answer_question";

const RoomPage = (props) => {
    const ws = useRef(null);
    const [roomUserData, setRoomUserData] = useState({})
    const [messages, setMessages] = useState([])
    const addNewMessage = useCallback(() => {
        setMessages([...messages])
    },
    [, messages]);

    let { roomId } = useParams();
    let { userId } = useParams();

    useEffect(() => {
        openAndListenToWebSocket();
        handleUserJoin()
        return () => {
            closeWebSocket()
        };
    }, []);

    const openAndListenToWebSocket = () => {
      ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/questions_notifications/${roomId}/`);
      ws.current.onopen = () => {
          ws.current.send(JSON.stringify({
              'type': USER_JOIN_ACTION,
              'user': userId,
              'message': "Joined Room",
              'action': "user_join"
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

    const sendAnswer = (question, answer) => {
      if (!ws.current || userId === "" ){
        return
      }
      ws.current.send(JSON.stringify({
          'type': ANSWER_QUESTION_ACTION,
          'user': userId,
          'message': {
            'question': question,
            'answer': answer,
          },
          'action': ANSWER_QUESTION_ACTION
      }));
    }


    useEffect(()=> {
      // console.log("Message Handler");
      // console.log(messages)
      let lastMessage = messages[messages.length - 1];
      handleLastMessageUpdate(lastMessage)
    }, [messages])

    useEffect(()=> {

      console.log(roomUserData)
    }, [roomUserData])

    const handleLastMessageUpdate = (payload) => {
      if (!payload || !payload.hasOwnProperty("action")) {
        return
      }
      console.log("handleLastMessageUpdate");
      // console.log(payload)
      switch(payload.action) {
        case USER_JOIN_ACTION:
          handleUserJoin(payload.message.users)
          break;
        case ANSWER_QUESTION_ACTION:
          handleUserAnswerQuestion(payload)

          break;
        default:
          console.log("unhandled message")
      }
    }

    const handleUserAnswerQuestion = (payload) => {
      const user = payload.user
      const answerMessage = payload.message
      const questionId = payload.message.question
      console.log(ANSWER_QUESTION_ACTION)
      console.log(payload)
      let currentRoomUserData = {...roomUserData}
      Object.keys(currentRoomUserData).forEach((user, i)=> {
          if (user !== payload.user){
            return;
          }
          if (currentRoomUserData[user].answers.hasOwnProperty(questionId)) {
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

    const handleUserJoin = (users) => {
      if (users ===undefined){
        console.log("users")
        console.log(users)
      }
      let roomUserDataUrl  = `${BASE_URL}/room/${roomId}/users/`
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



    return <div>
      <Room
        userId={userId}
        roomId={roomId}
        roomUserData={roomUserData}
        sendAnswerToServer={sendAnswer}
        currentQuestionId={144}/>
    </div>
}

export default RoomPage;
