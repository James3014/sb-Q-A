'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { addFavorite, removeFavorite } from '@/lib/favorites'

interface Props {
  lessonId: string
  isFavorited: boolean
  onToggle: () => void
}

export default function FavoriteButton({ lessonId, isFavorited, onToggle }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    
    if (isFavorited) {
      await removeFavorite(user.id, lessonId)
    } else {
      await addFavorite(user.id, lessonId)
    }
    
    onToggle()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-2xl"
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  )
}
