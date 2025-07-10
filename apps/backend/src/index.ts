//basic demo express server for testing 
import express from 'express'
import { prisma } from '@repo/db'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'test',
    },
  })
  res.json(users)
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})