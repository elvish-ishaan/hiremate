'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useMemo } from "react"
import { useRouter } from "next/navigation"

interface Report {
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
    sessionId: string
  }[]
}

export const CandidateReports = ({ reports }: { reports: Report[] }) => {
  const sortedReports = useMemo(
    () => [...reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [reports]
  )
  const router = useRouter()

  const renderScoreBadge = (score: number) => {
    if (score >= 3.5) return <Badge className="bg-green-100 text-green-800 border-green-200">Good</Badge>
    if (score >= 2) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>
  }

  const handleViewDetails = (report: Report) => {
    console.log('clicked report:', report.id);
    // Ensure that conversation[0] and sessionId exist before navigating
    if (report.conversation && report.conversation.length > 0 && report.conversation[0].sessionId) {
      router.push(`/reports/session/${report.conversation[0].sessionId}`);
    } else {
      console.warn("Session ID not found for this report, cannot navigate.");
      // Optionally, handle this case by showing an error or a fallback
    }
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="high">Top Scoring</TabsTrigger>
        <TabsTrigger value="low">Low Scoring</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Avg Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.map((report) => (
              <TableRow key={report.id} onClick={() => handleViewDetails(report)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell>
                  <div className="font-medium">{report.user?.name || "Unknown"}</div>
                  <div className="text-muted-foreground text-xs">{report.user?.email}</div>
                </TableCell>
                <TableCell>{format(new Date(report.createdAt), "PPP")}</TableCell>
                <TableCell>{format(new Date(report.createdAt), "p")}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {report.avgScore.toFixed(2)}
                  {renderScoreBadge(report.avgScore)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="high">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Avg Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports
              .filter((r) => r.avgScore >= 3.5)
              .map((report) => (
                <TableRow key={report.id} onClick={() => handleViewDetails(report)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <div className="font-medium">{report.user?.name || "Unknown"}</div>
                    <div className="text-muted-foreground text-xs">{report.user?.email}</div>
                  </TableCell>
                  <TableCell>{format(new Date(report.createdAt), "PPP")}</TableCell>
                  <TableCell>{format(new Date(report.createdAt), "p")}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {report.avgScore.toFixed(2)}
                    {renderScoreBadge(report.avgScore)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="low">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Avg Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports
              .filter((r) => r.avgScore < 2)
              .map((report) => (
                <TableRow key={report.id} onClick={() => handleViewDetails(report)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <div className="font-medium">{report.user?.name || "Unknown"}</div>
                    <div className="text-muted-foreground text-xs">{report.user?.email}</div>
                  </TableCell>
                  <TableCell>{format(new Date(report.createdAt), "PPP")}</TableCell>
                  <TableCell>{format(new Date(report.createdAt), "p")}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {report.avgScore.toFixed(2)}
                    {renderScoreBadge(report.avgScore)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  )
}