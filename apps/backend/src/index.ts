import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import portalRouter from './routes/portal'
import organizationRouter from './routes/organization'
import authRouter from './routes/auth'
import reportRouter from './routes/report'
import candidateRouter from './routes/candidate'

import cors from 'cors'

const app = express()

//parce json data
app.use(express.json())
//using cors
app.use(cors())

//init routes
app.use('/api/auth', authRouter)
app.use('/api/portal', portalRouter)
app.use("/api/organization", organizationRouter)
app.use("/api/report", reportRouter)
app.use("/api/candidate", candidateRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(8080, () => {
  console.log('Server is running...')
})