'use client'

import { useState } from 'react'
import KundliCard from './kundli-card'

interface Kundli {
  id: string
  name: string
  birthDate: Date
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
  timezone: string
  chartData: any
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface KundlisGridProps {
  initialKundlis: Kundli[]
}

export default function KundlisGrid({ initialKundlis }: KundlisGridProps) {
  const [kundlis, setKundlis] = useState(initialKundlis)

  const handleDelete = (id: string) => {
    setKundlis(kundlis.filter(k => k.id !== id))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {kundlis.map((kundli) => (
        <KundliCard
          key={kundli.id}
          kundli={kundli}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
