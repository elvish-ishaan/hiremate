'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
import { API_URL } from '@/app/constant'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface Session {
  id: string
  createdAt: string
  avgScore: number
  user: {
    name: string
    email: string
  }
  conversation: {
    id: string
    question: string
    answer: string
    score: number
  }[]
}

const getScoreBadge = (score: number) => {
  if (score >= 3.5)
    return <Badge className="bg-green-100 text-green-800 border-green-200">Good</Badge>
  if (score >= 2)
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
  return <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>
}

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/report/session/${sessionId}`)
        console.log(res,'getting session ')
        setSession(res.data?.data)
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setLoading(false)
      }
    }
    if (sessionId) fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 mt-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!session) {
    return <div className="text-center text-muted-foreground mt-10">No session data found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Overview</CardTitle>
          {/* <CardDescription>{format(new Date(session.createdAt), 'PPPpp')}</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">User:</span> {session.user?.name}
          </div>
          <div>
            <span className="font-medium">Email:</span> {session.user?.email}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Average Score:</span>
            {session.avgScore?.toFixed(2)} {getScoreBadge(session?.avgScore)}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {session.conversation?.map((item, index) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
              <CardDescription className="text-muted-foreground">
                Score: {item?.score} {getScoreBadge(item?.score)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="font-semibold text-sm text-muted-foreground">Q:</span>
                <p className="text-base">{item?.question}</p>
              </div>
              <Separator />
              <div className="mt-2">
                <span className="font-semibold text-sm text-muted-foreground">A:</span>
                <p className="whitespace-pre-wrap">{item?.answer}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SessionPage
