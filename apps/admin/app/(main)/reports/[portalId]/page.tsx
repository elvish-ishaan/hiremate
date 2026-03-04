'use client'

import { API_URL } from "@/app/constant"
import { CandidateReports } from "@/components/reports/ReportRen"
import axios from "axios"
import type React from "react"
import { use, useEffect, useState } from "react"

type ReportsType = React.ComponentProps<typeof CandidateReports>['reports']

export default function Page({ params }: { params: Promise<{ portalId: string }> }) {
  const { portalId } = use(params)
  const [reports, setReports] = useState<ReportsType>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${API_URL}/report/portalReport/${portalId}`)
        setReports(res.data.data)
      } catch (err) {
        setError("Failed to load reports.")
        console.error("Error fetching reports:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [portalId])

  if (loading) return <div className="p-4 text-muted">Loading reports...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <CandidateReports reports={reports} />
    </div>
  )
}
