import { prisma } from '@repo/db';
import { WebSocketServer } from 'ws';
import { agent } from './agent/agentClient';
import getSystemPrompt from './lib/prompts';
import { parse } from 'url';


enum STATUS {
  START = "start",
  ONGOING = 'ongoing',
  FINISHED = 'finished'  
}
interface IncomingDataProps {
  userId: string;
  type: STATUS;
  answer: string;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async function connection(ws, req) {
    //if error throw error
  ws.on('error', console.error);
  
  if(!req.url){
    return;
  }
  const { pathname, query } = parse(req.url, true);
  //get the portal id 
  const portalId = query.portalId;
  if(!portalId){
    return;
  }
  const portal = await prisma.portal.findFirst({
    where: {
        id: portalId as string
    }
  })
  if(!portal){
    return;
  }
  //create a session
  const userId = query.userId;
  if(!userId){
    return;
  }
  const session = await prisma.session.create({
    data: {
      portalId: portal.id,
      userId: userId as string,
    }
  })
  console.log(session,'session created')
  //feed the context to agent initially
  const response = await agent.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Initial conversation",
    config: {
      systemInstruction: getSystemPrompt(portal),
    },
  });
  const ResData = {
    question: response.text,
    sessionId: session.id,
    portalId: portal.id,
  }
  //send back the responce
  ws.send(JSON.stringify(ResData));

  //listen for the message event
  ws.on('message', async function incoming(data: IncomingDataProps) {
    const parcedData = JSON.parse(data.toString());
    //if status finished dont send any more messages
    if(parcedData.status === STATUS.FINISHED){
      console.log("finished")
      ws.close();
      return;
    }
    //if status start send the question
    const response = await agent.models.generateContent({
      model: "gemini-2.0-flash",
      //pass the prev conversation and latest answer to the agent
      contents: parcedData.answer,
      config: {
        systemInstruction: getSystemPrompt(portal),
      },
    });
    //save the conversation to db
    try {
     //find session and add conversation to it
     const updatedSesion = await prisma.session.update({
       where: {
         id: ResData.sessionId
       },
       data: {
         conversation: {
           create: {
             question: ResData.question as string,
             answer: parcedData.answer as string,
           }
         }
       },
     })
     console.log(updatedSesion, 'this is the updated sesion')
    } catch (error) {
      console.log(error, "error in saving db")
      ws.send("error in saving db")
    }
    //prepare the response data
    const responseData = {
      status: STATUS.ONGOING,
      question: response.text,
      sessionId: session.id,
      portalId: portal.id,
    }
    //continue the conversation
    ws.send(JSON.stringify(responseData));
  });
  
});